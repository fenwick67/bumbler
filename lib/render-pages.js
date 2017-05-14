// metalsmith plugin for rendering files

var _ = require('lodash');
var pug = require('pug');
var async = require('async');
var path = require('path')

// files is just the JSON objects for each post
module.exports = function(files,metalsmith,done){

  console.log('rendering pages')
  // local vars
  var settings = null;
  var siteInfo = {};

  var settingsController = new DiskController({path:path.join(process.cwd(),'bumbler.json')});

  var jsonPosts = _.map(files,filename,data=>{
    delete files[filename];
    return JSON.parse(data.contents.toString('utf8'))
  });

  // sort em by date new to old
  jsonPosts = _.orderBy(jsonPosts,'date','desc');

  var compiledFn = pug.compileFile( path.join(process.cwd(),'template.pug','_bumblersrc','layout.pug') );

  settingsController.load(er=>{
    if (er){return done(er)}
    settings = settingsController.get();
    settings.postsPerPage = Number(settings.postsPerPage) || 10;
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
    }catch(e){
      err = e
    }
    // always
    done(err);

  }


  function getLinks(pageNumber){
    return {
      nextPage:(pageNumber && pageNumber < siteInfo.pageCount) ? '/page/'+(pageNumber+1) : null,
      previousPage:(pageNumber && pageNumber > 1) ?'/page/'+(pageNumber-1):null
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

      addFile(compiledFn(locals),post.id)
    });
  }
  function renderPages(){
    // create each page
    var postGroups = _.chunk(jsonPosts,siteInfo.postsPerPage||10)
    var pageN = 1;
    postGroups.forEach(posts=>{
      pageN ++;

      var locals = {
        site:siteInfo,
        page:{
          number:pageN,
          posts:posts,
          links:getLinks(pageN)
        }
      };

      addFile(compiledFn(locals),'page/'+pageN);

    });

  }
  function renderIndex(){
    // uhhh
    var postGroup = _.chunk(jsonPosts,siteInfo.postsPerPage||10)[0]

    var links = {
      nextPage:(pageN < siteInfo.pageCount) ? '/page/'+(pageN+1) : null,
      previousPage:(pageN > 1) ?'/page/'+(pageN-1):null
    };

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

}
