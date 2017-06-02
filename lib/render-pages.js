// metalsmith plugin for rendering files

var _ = require('lodash');
var pug = require('pug');
var async = require('async');
var path = require('path')
var DiskController = require('./DiskController');
var renderAtom = require('./render-atom')
var chalk = require('chalk');
var fs = require('graceful-fs');
var hydrate = require('./hydrate-posts');

var ASYNC_LIMIT = 100;

// files is just the JSON objects for each post
module.exports = function(filenames,done){

  console.log('rendering pages')
  // local vars
  var settings = null;
  var siteInfo = {};

  var settingsController = new DiskController({path:path.join(process.cwd(),'bumbler.json')});

  // sort em by date new to old
  var orderedNames = _.orderBy(filenames,name=>{
    // beLEIVE IT or NOT we can sort by uuidV1s
    var spl = name.split(/[\.\-]/g);
    return Number('0x'+spl[2]+spl[1]+spl[0]);
  },'desc');

  var compiledFn = pug.compileFile( path.join(process.cwd(),'_bumblersrc','layout.pug') );

  settingsController.load(er=>{
    if (er){return done(er)}
    settings = _.cloneDeep(settingsController.get());
    settings.postsPerPage = Number(settings.postsPerPage) || 10;
    console.log(settings);
    try{
      settings.metadata = JSON.parse(settings.metadata);
    }catch(e){
      console.log(chalk.yellow('Error parsing settings metadata to JSON.  Metadata will be an empty object.'))
      settings.metadata = {};
    }
    // set number of pages
    siteInfo.postCount = orderedNames.length;
    siteInfo.pageCount = Math.ceil(orderedNames.length / settings.postsPerPage )
    _.extend(siteInfo,settings);
    renderAll();
  });

  function renderAll(){
    async.parallel([
      renderPosts,
      renderPages,
      renderIndex,
      renderAtomFeed
    ],(er)=>{
      console.log('done')
      done(er);
    })
  }


  function getLinks(pageNumber){
    return {
      nextPage:(pageNumber && pageNumber < siteInfo.pageCount) ? '/page/'+(pageNumber+1)+'.html' : null,
      previousPage:(pageNumber && pageNumber > 1) ?'/page/'+(pageNumber-1)+'.html' :null
    }
  }

  function renderPosts(callback){
    // each post
    async.eachLimit(orderedNames,ASYNC_LIMIT,(name,cb)=>{
      fs.readFile(path.join(process.cwd(),'_bumblersrc/posts',name),'utf8',(er,file)=>{
        if (er){return cb(er);}

        var post;
        try{
          post = hydrate(JSON.parse(file));
        }catch(e){
          return cb(e);
        }

        var locals = {
          site:siteInfo,
          page:{
            posts:[post],
            links:getLinks(null)
          }
        };

        var filename = path.join(process.cwd(),'post',name.replace(/\..*/g,''))+'.html';
        console.log('built post'+name+', writing...')

        fs.writeFile(filename,compiledFn(locals),cb);

      });

    },callback);

  }

  function renderPages(callback){
    // create each page
    var postGroups = _.chunk(orderedNames,siteInfo.postsPerPage);
    async.eachOfLimit(postGroups,ASYNC_LIMIT,(postNames,index,cb0)=>{
      var pageN = index + 1;

      // load each post for this page
      var posts = [];
      async.eachSeries(postNames,(name,cb)=>{
        fs.readFile(path.join(process.cwd(),'_bumblersrc/posts',name),'utf8',(er,post)=>{
          if (er){return cb(er)}
          try{
            posts.push(hydrate(JSON.parse(post)));
          }catch(e){
            return cb(e);
          }
          return cb(null);
        })
      },function postsLoaded(er){
          // when posts are done being loaded
          if (er){return cb0(er)}
          var locals = {
            site:siteInfo,
            page:{
              number:pageN,
              posts:posts||[],
              links:getLinks(pageN)
            }
          };
          var filename = path.join(process.cwd(),'page/'+pageN+'.html');
          console.log('built page'+pageN+', writing...')

          fs.writeFile(filename,compiledFn(locals),cb0);

        })

    },callback);

  }

  function renderIndex(callback){
    // create the page
    var postNames = _.chunk(orderedNames,siteInfo.postsPerPage)[0]||[];
      var pageN = 1;

      // load each post for this page
      var posts = [];
      async.eachSeries(postNames,(name,cb)=>{
        fs.readFile(path.join(process.cwd(),'_bumblersrc/posts',name),'utf8',(er,post)=>{
          if (er){return cb(er)}
          try{
            posts.push(hydrate(JSON.parse(post)))
          }catch(e){
            return cb(e);
          }
          return cb(null);
        })
      },function postsLoaded(er){
        // when posts are done being loaded
        if (er){return callback(er)}
        var locals = {
          site:siteInfo,
          page:{
            number:pageN,
            posts:posts,
            links:getLinks(pageN)
          }
        };
        var filename = path.join(process.cwd(),'index.html');
        console.log('built index, writing...')
        fs.writeFile(filename,compiledFn(locals),callback);

      })

  }

  function renderAtomFeed(cb){

    // read the first 10 posts
    var first10Names = _.slice(orderedNames,0,10)||[];
    var posts = [];

    async.eachOfSeries(first10Names,(name,index,done)=>{
      fs.readFile(path.join(process.cwd(),'_bumblersrc/posts',name),'utf8',(er,contents)=>{
        if(er){
          return done(er);
        }
        try{
          posts[index] = hydrate(JSON.parse(contents));
        }catch(e){
          return done(er);
        }
        return done(null);
      })
    },function loadedAll(er){
      if (er){return cb(er);}

      var locals = {
        site:siteInfo,
        posts:posts,
        path:require('path'),
        moment:require('moment')
      }
      var renderedXml = renderAtom(locals);
      fs.writeFile(path.join(process.cwd(),'atom.xml'),renderedXml,cb);

    })

  }


}
