// load plugins and execute their hooks

var path = require('path');
var pluginDir = path.join(process.cwd(),'_bumblersrc','plugins');
var fs = require('fs-extra');
var _ = require('lodash');
var async = require('async');
var Post = require('./Post');
var build = require('./build.js');

// this is what is exposed to the plugin
var pluginLib = {
  buildPages:function(done){
    return build.buildPages(done||function(){})
  },
  getPost:function(id,done){
    var filename = path.join(process.cwd(),'_bumblersrc/posts',id.toUpperCase()+'.json');
    fs.readFile(filename,'utf8',function(er,result){
      if(er){return done(er);}
      var json;
      try{
        json = JSON.parse(result);
      }catch(e){
        return done(e);
      }
      return done(null,json);

    })
  },
  putPost:function(post,done){
    var p = new Post(post);// apply defaults
    var filename = path.join(process.cwd(),'_bumblersrc/posts',p.id+'.json');
    fs.outputFile(filename,JSON.stringify(p,null,2),done);
  },
  getOptions:getOptions,
  setOptions:setOptions
};

var loadedPlugins = [];

var pluginsLoaded = false;

// load plugins on start

// NOTE: Gulp sucks and so we need to make sure we don't do this until after a tick or Two

setTimeout(function(){

  fs.ensureDir(pluginDir,function(er){
    if (er){throw er}
    fs.readdir(pluginDir,function(er,dirnames){
        if(er){throw er}

        async.each(dirnames,function(dirname,pluginReady){

          require(path.join(pluginDir,dirname))(pluginLib,function(er,plugin){
            loadedPlugins.push({
              dirname:dirname,
              name:plugin.name||dirname,
              hooks:plugin.hooks||{},
              optionsSchema:plugin.optionsSchema||{}
            });
            pluginReady();
          });

        },function done(er){
          if (er){
            console.log('error with plugins')
            throw er;
            process.exit(1)
          }
          console.log('plugins loaded');
          pluginsLoaded = true;
          _onLoad();
        });

    })
  })

},0)


/*
  fire hooks with a result
  hooks by default are asyncronous reducers.  So for example, to apply all reducers

  fireHooks('beforePageRender',{title:"place"},function(er,newSiteInfo){
    // render a page or whatever
  });

*/
function fireHook(hookName,originalObj,done){
  whenLoaded(function(){

    var hookFunctions = [];
    _.each(loadedPlugins,function(plugin){
      if (plugin.hooks[hookName]){
        hookFunctions.push(plugin.hooks[hookName]);
      }
    });

    // no hooks to fire!  cool.
    if (hookFunctions.length < 1){
      return done(null,originalObj);
    }

    var currentObj = originalObj;

    // execute the hook functions
    async.eachSeries(hookFunctions,function(f,done){
      // call the function with the current object, then call the next one
      f(currentObj,function hookComplete(er,newObject){
        if (er){return done(er);}
        currentObj = newObject||false;
        done(null);
      });

    },function hooksDone(er){
      return done(er,currentObj);
    });

  })

}


// listen for load:
var loadedListeners = [];

// plugins loaded
function _onLoad(){
  setTimeout(function(){
    loadedListeners.forEach(function(listener){
      listener();
    })
  },0)
}

// listen for plugins to be ready
whenLoaded = function(callback){
  if (pluginsLoaded){
    setTimeout(function(){callback()},0);
  }else{
    loadedListeners.push(callback);
  }
}

exports.fireReducerHook = fireHook;
// don't reduce values
exports.fireHook = function(hookName,done){
  return fireHook(hookName,false,function hookComplete(er){
    return done(er);
  });
}


///////////////////////////////////////// options management ////////////////////////////////////////////////////////////

// this is just for the admin page so just return it all at once IMO
getOptionsSchema = function(){
  var ret = {};
  loadedPlugins.forEach(function(p){
    ret[plugin.name] = plugin.optionsSchema||{};
  });
  return ret;
}

function getAllOptions(done){
  var ret = {};
  async.each(loadedPlugins,function(p,done){
    getOptions(p.name,function(er,opts){
      if (!er){
        ret[p.name] = opts;
      }
      return done(er);
    })
  },function doneLoading(er){
    return done(er,ret);
  })
}

function getOptionsFilename(pluginName){
  var plugin = _.filter(loadedPlugins,{"name":pluginName});
  if (!plugin.length){return done(new Error("plugin doesn't exist or hasn't been loaded"));}
  plugin = plugin[0];
  return path.join(pluginDir,plugin.dirname,'options.json');
}

function setOptions(name,options,done){
  var filename = getOptionsFilename(name);
  fs.writeFile(filename,JSON.stringify(options),done);
}

function getOptions(pluginName,done){

  var filename = getOptionsFilename(pluginName);
  fs.ensureFile(filename,function(er){
    fs.readFile(filename,'utf8',function(er,data){
      var obj;
      if (data.length <= 2){
        obj = {};
      }else{
        try{
          obj = JSON.parse(data);
        }catch(e){
          return callback(e);
        }
        return callback(null,obj)
      }
    });
  });
}

exports.getOptions = getOptions;
exports.setOptions = setOptions;
exports.getAllOptions = getAllOptions;
exports.getOptionsSchema = getOptionsSchema;
