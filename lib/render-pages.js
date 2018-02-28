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
var url = require('url');
var plugins = require('./plugins')
var ulid = require('ulid').ulid

var ASYNC_LIMIT = 100;

module.exports = function(filenames,done){

  console.log('rendering pages')
  // local vars
  var settings = null;
  var siteInfo = {};

  var settingsController = new DiskController({path:path.join(process.cwd(),'_bumblersrc','bumbler.json')});

  // sort em by date new to old
  var orderedNames = filenames.sort(function(a,b){
    return b.localeCompare(a);
  });

  var templateDefaults =  {
    _:_,
    page:{
      isIndex:false,
      isCustom:false,
      number:null,
      links:null
    },
    site:siteInfo
  };
  var compiledTemplate = pug.compileFile( path.join(process.cwd(),'_bumblersrc','layout.pug') );

  var addDefaults = function(locals){
    // return a new object with defaults added
    return _.merge({},templateDefaults,locals);
  }

  var compiledFn = function(locals){
    return compiledTemplate(addDefaults(locals));
  }

  settingsController.load(er=>{
    if (er){return done(er)}
    settings = _.cloneDeep(settingsController.get());
    if (settings.reverseOrder){
      orderedNames = _.reverse(orderedNames);
    }
    settings.postsPerPage = Number(settings.postsPerPage) || 10;

    // parse metadata
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
    getTags(function(er){
      if (er){
        return done(er);
      }
      async.parallel([
        renderPosts,
        renderPages,
        renderTags,
        renderAtomFeed
      ],(er)=>{
        if(er){return done(er);}
        async.series([
          renderCustomPages,
          linkStatic,
          linkAssets
        ],function(er){
          console.log('finished building pages');
          done(er);
        });
      });
    });
  }

  // get all tags and put into site info
  function getTags(callback){
    var tags = {}; // title:count
    async.eachLimit(orderedNames,ASYNC_LIMIT,(name,cb)=>{
      fs.readFile(path.join(process.cwd(),'_bumblersrc/posts',name),'utf8',(er,file)=>{
        if (er){return cb(er);}
        var post;
        try{
          post = hydrate(JSON.parse(file));
        }catch(e){
          return cb(e);
        }
        if (Array.isArray(post.tags)){
          post.tags.forEach(tag=>{
            if (tags[tag]){
              tags[tag]++;
            }else{
              tags[tag]=1;
            }
          });
        }
        return cb(null);
      });
    },function(er){
      if (er){return callback(er);}

      siteInfo.tags = _.chain(tags)
        .map((count,name)=>{ return {count,name} })
        .sortBy('name') // Sort by name first
        .orderBy('count','desc') // (stable) Sort by count, guaranteeing tag order between builds
        .value()

      return callback(null);
    });
  }

  function urlForHref(href){
    return url.resolve(settings.siteUrl,href);
  }

  //
  function getLinks(pageNumber,tag,count){
    if (typeof count == "undefined"){
      count = siteInfo.pageCount;
    }

    var ret = {};

    if (tag){
      var idxPage = '/tag/'+tag+'/';
      ret.firstPage = idxPage;

      ret.nextPage = (pageNumber && pageNumber < count) ? '/tag/'+tag+'/'+(pageNumber+1)+'.html' : null;
      if (pageNumber == 2){
        ret.previousPage = ret.firstPage;
      }else{
        ret.previousPage = (pageNumber && pageNumber > 1) ?'/tag/'+tag+'/'+(pageNumber-1)+'.html' :null;
      }
      ret.lastPage = (count > 1) ?'/tag/'+tag+'/'+(count)+'.html' :idxPage;

      if (settings.reverseOrder){
        // flip first and last
        ret.lastPage = idxPage;
        ret.firstPage = '/tag/'+tag+'/1.html'
      }
    }

    else{
      var idxPage = '/';
      ret.firstPage = idxPage;

      ret.nextPage = (pageNumber && pageNumber < count) ? '/page/'+(pageNumber+1)+'.html' : null;
      if (pageNumber == 2){
        ret.previousPage = ret.firstPage;
      }
      else {
        ret.previousPage = (pageNumber && pageNumber > 1) ?'/page/'+(pageNumber-1)+'.html' :null
      }
      ret.lastPage = (count > 1) ?'/page/'+(count)+'.html' :idxPage;

      if (settings.reverseOrder){
        // flip first and last
        ret.lastPage = idxPage;
        ret.firstPage = '/page/1.html'
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
          page:{
            posts:[post],
            links:getLinks(null),
            url:urlForHref(post.permalink)
          }
        };

        var filename = path.join(process.cwd(),'post',name.replace(/\..*/g,''))+'.html';
        // console.log('built post'+name+', writing...')

        // fire hooks
        plugins.fireReducerHook('beforePageRender',addDefaults(locals),function(er,newLocals){
          fs.outputFile(filename,compiledFn(newLocals),cb);
        });

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
            page:{
              number:pageN,
              posts:posts||[],
              links:getLinks(pageN),
              url:urlForHref('/page/'+pageN+'.html')
            }
          };

          var toWrite = [ [ path.join(process.cwd(),'page/'+pageN+'.html'), locals ] ]

          // if it's the index page, duplicate this but set isIndex to true
          if (pageN == 1 && !settings.reverseOrder || pageN == siteInfo.pageCount  && settings.reverseOrder){
            var newLocals = {
              page:{
                number:pageN,
                posts:posts||[],
                links:getLinks(pageN),
                isIndex:true,
                url:urlForHref('/')
              }
            };
            toWrite.push([ path.join(process.cwd(),'/index.html') , newLocals ])
          }

          // console.log('built page'+pageN+', writing...')
          async.eachSeries(toWrite,function(data,cb){
            var filename = data[0];
            var fileLocals = data[1];

            plugins.fireReducerHook('beforePageRender',addDefaults(fileLocals),function(er,newLocals){
              fs.outputFile(filename,compiledFn(newLocals),cb);
            });

          },cb0);

        })

    },callback);

  }

    function renderTags(callback){
      // put each file into a tags array
      var tagsMap = {};
      async.eachLimit(orderedNames,ASYNC_LIMIT,(postName,cb0)=>{
        fs.readFile(path.join(process.cwd(),'_bumblersrc/posts',postName),'utf8',(er,post)=>{
          if (er){return cb0(er);}
          var postObj;
          try{
            postObj = hydrate(JSON.parse(post));
            if (postObj.tags && Array.isArray(postObj.tags)){
              postObj.tags.forEach(function(tag){
                var t = tag.toLowerCase();
                if (!tagsMap[t]){
                  tagsMap[t] = [];
                }
                tagsMap[t].push(postName);
              });
            }
          }catch(e){
            return cb0(er);
          }
          return cb0(null);
        });
      },function mapped(er){
        if (er){return callback(er);}
        // now tagsMap has keys with tags and values with post names.
        // render each tag now
        async.eachLimit(Object.keys(tagsMap),ASYNC_LIMIT,(tag,cb1)=>{
          renderTagPages(tag,tagsMap[tag],cb1);
        },callback);
      });
    }

    // render all pages for given tag and post names
    function renderTagPages(tag,postNames,callback){
      // console.log('rendering tag "'+tag+'"')

      // order the posts
      var postNames = _.orderBy(postNames,name=>{
        return name;
      },settings.reverseOrder?'asc':'desc');

      // create each page
      var postGroups = _.chunk(postNames,siteInfo.postsPerPage);

      // tag may be empty, so make an empty page?
      if (postGroups.length == 0){
        postGroups = [[]];
      }

      async.eachOfLimit(postGroups,ASYNC_LIMIT,(postNames,index,cb0)=>{
        var pageN = index + 1;
        var nPages = postGroups.length

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
            var nP = nPages;

            if (er){return cb0(er)}
            var locals ={
              site:{pageCount:nP},
              page:{
                number:pageN,
                posts:posts||[],
                links:getLinks(pageN,tag,postGroups.length),
                tag:tag,
                url:urlForHref('/tag/'+tag+( pageN==1?'':('/'+pageN+'.html') ) )
              }
            };
            // console.log('built page'+pageN+', writing...');

            var filenames = [path.join(process.cwd(),'tag/'+tag+'/'+pageN+'.html')];

            if (pageN == 1 && !settings.reverseOrder || pageN == nP  && settings.reverseOrder){
              filenames.push( path.join(process.cwd(),'tag/'+tag+'/index.html') )
            }
            async.eachSeries(filenames,function(filename,cb){
              plugins.fireReducerHook('beforePageRender',addDefaults(locals),function(er,newLocals){
                fs.outputFile(filename,compiledFn(newLocals),cb);
              });
            },cb0);

          })

      },callback);

    }


  function renderAtomFeed(done){

    fs.ensureDir(path.join(process.cwd(),'atom'),function(er){
      if(er){return done(er);}
      whenDirExists();
    })

    function whenDirExists(){
      // create each page
      var postGroups = _.chunk(orderedNames,20);
      var nPages = postGroups.length;

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
              _:_,
              site:siteInfo,
              posts:posts,
              path:require('path'),
              moment:require('moment'),
              page:pageN,
              nPages:nPages
            }

            var isIndex = (pageN === 1);

            var feedPageName = (isIndex?'feed':pageN)+'.xml';

            var toWrite = [ [ path.join(process.cwd(),'atom',feedPageName), locals ] ]          

            // console.log('built page'+pageN+', writing...')
            async.eachSeries(toWrite,function(data,cb){
              var filename = data[0];
              var fileLocals = data[1];

              var renderedXml = renderAtom(fileLocals);

              fs.outputFile(filename,renderedXml,cb);

            },cb0);

          })

      },done);

    }

  }

  // read the "pages" dir and render 'em like they were individual posts with a custom url
  function renderCustomPages(cb){
    var src = path.join(process.cwd(),'_bumblersrc/pages');
    fs.readdir(src,function(er,filenames){
      if (er){return cb(er);}
      async.eachOfLimit(filenames,ASYNC_LIMIT,(name,index,cb0)=>{
        fs.readFile(path.join(src,name),'utf8',(er,data)=>{
          if (er){return cb0(er);}
          var obj;
          var route;
          try{
            obj = JSON.parse(data);
            route = obj.route;
            if (!route){throw new Error('custom page must have a route')}
          }catch(e){
            return cb0(e);
          }
          var dest = path.join(process.cwd(),route+'.html');
          var locals = {
            page:{
              customPage:obj,
              isCustom:true,
              url:urlForHref(obj.route)
            }
          }

          plugins.fireReducerHook('beforePageRender',addDefaults(locals),function(er,newLocals){
            var result = compiledFn(newLocals);
            fs.outputFile(dest,result,cb0);
          });

        });
      },cb);
    })
  }

  // symlink all static files
  function linkStatic(cb){
    var src = path.join(process.cwd(),'_bumblersrc/static');
    fs.ensureDir(src,function(er){
      if(er){return cb(er);}
      fs.readdir(src,function(er,files){
        console.log('linking static files')
        if(er){return cb(er);}
        // now for each file (or folder), link it
        async.each(files,function(file,callback){
          var linkPath = path.join(process.cwd(),file);
          var filePath = path.join('_bumblersrc','static',file);
          fs.ensureSymlink(
            filePath,
            linkPath,
            callback
          );
        },cb);
      });
    })
  }

  function linkAssets(cb){
    console.log('linking asset folder')
    var linkPath = path.join(process.cwd(),'assets');
    var folderPath = path.join('_bumblersrc','assets');
    fs.ensureSymlink(
      folderPath,
      linkPath,
      cb
    );
  }


}


// helpers

// chunk the posts up and do something with each chunk.  
// The eachChunk itaree is called with the chunk, its index, the array of all chunks, and a callback to call when it is done
function chunkAndExecute(posts,chunkSize,eachChunk,done){
  //
  var chunks = _.chunk(posts);

  async.eachOfLimit(chunks,ASYNC_LIMIT,function(chunk,index,ok){
    eachChunk(chunk,index,chunks,ok)
  },done)
}