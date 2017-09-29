// metalsmith plugin for rendering files

var _ = require('lodash');
var pug = require('pug');
var async = require('async');
var path = require('path')
var DiskController = require('./DiskController');
var renderAtom = require('./render-atom')
var chalk = require('chalk');
var fs = require('fs-extra');
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
    return name;
  },'desc');

  var compiledFn = pug.compileFile( path.join(process.cwd(),'_bumblersrc','layout.pug') );

  settingsController.load(er=>{
    if (er){return done(er)}
    settings = _.cloneDeep(settingsController.get());
    settings.postsPerPage = Number(settings.postsPerPage) || 10;
    console.log(settings);

    // parse metadata
    try{
      settings.metadata = JSON.parse(settings.metadata);
    }catch(e){
      console.log(chalk.yellow('Error parsing settings metadata to JSON.  Metadata will be an empty object.'))
      settings.metadata = {};
    }

    // parse categories from string, JSON array string, or array
    if (Array.isArray(settings.categories)){
      // noop
    }else if (typeof settings.categories == 'string'){
      try{
        settings.categories = json.parse(settings.categories);
      }catch(e){
        settings.categories = settings.categories.split(',');
      }
    }else{
      settings.categories = [];
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
      renderCategories,
      renderAtomFeed
    ],(er)=>{
      console.log('done')
      done(er);
    })
  }


  //
  function getLinks(pageNumber,category,count){
    if (typeof count == "undefined"){
      count = siteInfo.pageCount;
    }

    var ret = {};

    if (category){
      ret.nextPage = (pageNumber && pageNumber < count) ? '/category/'+category+'/'+(pageNumber+1)+'.html' : null;
      if (pageNumber == 2){
        ret.previousPage='/category/'+category+'/';
      }else{
        ret.previousPage = (pageNumber && pageNumber > 1) ?'/category/'+category+'/'+(pageNumber-1)+'.html' :null;
      }
    }

    else{
      ret.nextPage = (pageNumber && pageNumber < count) ? '/page/'+(pageNumber+1)+'.html' : null;
      if (pageNumber == 2){
        ret.previousPage='/'
      }
      else {
        ret.previousPage=(pageNumber && pageNumber > 1) ?'/page/'+(pageNumber-1)+'.html' :null
      }
    }

    return ret;
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

        fs.outputFile(filename,compiledFn(locals),cb);

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

          fs.outputFile(filename,compiledFn(locals),cb0);

        })

    },callback);

  }

    function renderCategories(callback){
      // put each file into a category array
      var categoriesMap = {};
      settings.categories.forEach(c=>{categoriesMap[c] = []})
      async.eachLimit(orderedNames,ASYNC_LIMIT,(postName,cb0)=>{
        fs.readFile(path.join(process.cwd(),'_bumblersrc/posts',postName),'utf8',(er,post)=>{
          if (er){return cb0(er);}
          var postObj;
          try{
            postObj = JSON.parse(post);
            if (postObj.category && categoriesMap[postObj.category]){
              categoriesMap[postObj.category].push(postName);
              console.log(categoriesMap[postObj.category]);
            }
          }catch(e){
            return cb0(er);
          }
          return cb0(null);
        });
      },function mapped(er){
        console.log('mapped')
        if (er){return callback(er);}
        // now categoriesMap has keys with categories and values with post names.
        // render each category now
        async.eachLimit(Object.keys(categoriesMap),ASYNC_LIMIT,(category,cb1)=>{
          renderCategoryPages(category,categoriesMap[category],cb1);
        },callback);
      });
    }

    // render all pages for given category name and post names
    function renderCategoryPages(category,postNames,callback){
      console.log('rendering category "'+category+'"')

      // order the posts
      var postNames = _.orderBy(postNames,name=>{
        return name;
      },'desc');

      // create each page
      var postGroups = _.chunk(postNames,siteInfo.postsPerPage);

      // categories may be empty, so make an empty page!
      if (postGroups.length == 0){
        postGroups = [[]];
      }

      async.eachOfLimit(postGroups,ASYNC_LIMIT,(postNames,index,cb0)=>{
        var pageN = index + 1;
        var nPages = Math.ceil(postGroups.length / siteInfo.postsPerPage);
        console.log(nPages);

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
            // when posts are done being loaded for this page
            if (er){return cb0(er)}
            var locals = {
              site:siteInfo,
              page:{
                number:pageN,
                posts:posts||[],
                links:getLinks(pageN,category,postGroups.length),
                category:category
              }
            };
            var filename = path.join(process.cwd(),'category/'+category+'/'+pageN+'.html');
            if (pageN == 1){
              filename = path.join(process.cwd(),'category/'+category+'/index.html');
            }
            console.log('built page'+pageN+', writing...');
            fs.outputFile(filename,compiledFn(locals),cb0);
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
        fs.outputFile(filename,compiledFn(locals),callback);

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
      fs.outputFile(path.join(process.cwd(),'atom.xml'),renderedXml,cb);

    })

  }


}
