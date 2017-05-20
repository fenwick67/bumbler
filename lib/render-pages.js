// metalsmith plugin for rendering files

var _ = require('lodash');
var pug = require('pug');
var async = require('async');
var path = require('path')
var DiskController = require('./DiskController');
var renderAtom = require('./render-atom')

// files is just the JSON objects for each post
module.exports = function(files,metalsmith,done){

  console.log('rendering pages')
  // local vars
  var settings = null;
  var siteInfo = {};

  var settingsController = new DiskController({path:path.join(process.cwd(),'bumbler.json')});

  var jsonPosts = _.map(files,(file,filename)=>{
    var s =  JSON.parse(file.contents.toString('utf8'))
    delete files[filename];
    return s;
  });

  jsonPosts = jsonPosts || [];

  // sort em by date new to old
  // note: use ISO date (TZ 0) for sorting
  jsonPosts = _.orderBy(jsonPosts,post=>{
    return new Date(post.date).toISOString();
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
    siteInfo.postCount = jsonPosts.length;
    siteInfo.pageCount = Math.ceil(jsonPosts.length / settings.postsPerPage )
    _.extend(siteInfo,settings);
    renderAll();
  });

  function renderAll(){
    var err = null;
    try{
      renderPosts();
      renderPages();
      renderIndex();
      renderAtomFeed();
    }catch(e){
      err = e
    }
    // always
    done(err);
  }


  function getLinks(pageNumber){
    return {
      nextPage:(pageNumber && pageNumber < siteInfo.pageCount) ? '/page/'+(pageNumber+1)+'.html' : null,
      previousPage:(pageNumber && pageNumber > 1) ?'/page/'+(pageNumber-1)+'.html' :null
    }
  }

  function renderPosts(){
    jsonPosts.forEach(post=>{

      var locals = {
        site:siteInfo,
        page:{
          posts:[post],
          links:getLinks(null)
        }
      };

      addFile(compiledFn(locals),'post/'+post.id)
    });
  }
  function renderPages(){
    // create each page
    var postGroups = _.chunk(jsonPosts,siteInfo.postsPerPage)
    var pageN = 0;
    postGroups.forEach(posts=>{
      pageN ++;

      var locals = {
        site:siteInfo,
        page:{
          number:pageN,
          posts:posts||[],
          links:getLinks(pageN)
        }
      };

      addFile(compiledFn(locals),'page/'+pageN);

    });

  }
  function renderIndex(){
    // uhhh
    var postGroup = _.chunk(jsonPosts,siteInfo.postsPerPage)[0] || [];

    var locals = {
      site:siteInfo,
      page:{
        isIndex:true,
        number:1,
        posts:postGroup,
        links:getLinks(1)
      }
    }

    addFile(compiledFn(locals),'index');

  }

  function addFile(contents,name){
    var name = name + '.html';
    files[name] = {contents:new Buffer(contents)}
    console.log('built '+name);
  }

  function renderAtomFeed(){
    var locals = {
      site:siteInfo,
      posts:_.slice(jsonPosts,0,10)||[],
      path:require('path'),
      moment:require('moment')
    }
    var renderedXml = renderAtom(locals);
    files['atom.xml'] = {contents:new Buffer(renderedXml)}
    console.log('built atom feed');

  }

}
