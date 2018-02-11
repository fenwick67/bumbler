/*

These are all asynchronous functions that will be remote procedure called
by the admin interface, they are also made available to plugins.

*/

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const async = require('async');
const Post = require('./Post.js');
const buildLib = require('./build');
const DiskController = require('./DiskController');
const scripts = require('./scripts');

const settingsController = new DiskController({path:path.join(process.cwd(),'_bumblersrc/','bumbler.json')});
var templateController = new DiskController({path:path.join(process.cwd(),'_bumblersrc/','layout.pug'),isText:true});

const procedures = {};

// begin procedures

procedures.getPostIds = function(done){
  glob(path.join(process.cwd(),'_bumblersrc/posts/*.json'),function(er,results){
    if(er){return done(er);}
    return done(er,results.map(s=>path.parse(s).name))
  });
}

procedures.getPosts = procedures.getPostIds;

procedures.putPost = function(post,done){
  var p = new Post(post);
  var filename = path.join(process.cwd(),'_bumblersrc/posts',p.id+'.json');
  fs.outputFile(filename,JSON.stringify(post,null,2),done);
}

procedures.getPost = function(id,done){
  var filename = path.join(process.cwd(),'_bumblersrc/posts',id+'.json');
  fs.readFile(filename,'utf8',function(er,data){
    if(er){
      return done(er);
    }
    var result;
    try{
      result = JSON.parse(data);
    }catch(e){
      return done(e);
    }
    return done(null,result);
  })
}

procedures.deletePost = function(id,done){
  var filename = path.join(process.cwd(),'_bumblersrc/posts',id+'.json');
  fs.remove(filename,done);
}

procedures.build = function(done){
  return buildLib.buildPages(done);
}

procedures.buildPages = procedures.build;

procedures.getSettings = function(done){
  return settingsController.load(done);
}

procedures.setSettings = function(settings,done){
  return settingsController.save(settings,done);
}

procedures.getAssets = function(done){
  return glob(path.join(process.cwd(),'_bumblersrc','assets','*'),function(er,list){
    if(er){return done(er);}
    return done(er,list.map(s=>'/assets/'+path.parse(s).base))
  });
}

procedures.deleteAsset = function(filename,done){
  var filename = path.join(process.cwd(),'_bumblersrc','assets',filename);
  fs.remove(filename,done);
}

procedures.getCustomPages = function(done){
  glob(path.join(process.cwd(),'_bumblersrc/pages/*.json'),(er,files)=>{
    if (er){
      return done(er);
    }

    async.map(files,
      function itaree(filename,cb0){
        // just JSON.parse them
        fs.readFile(filename,'utf8',function(er,text){
          if(er){return cb0(er)}
          try{
            var j = JSON.parse(text);
            return cb0(null,j);
          }catch(e){
            return cb0(er);
          }
        });
      },
      done
    );
  });
}

procedures.getCustomPage = function(name,done){
  const filename = path.join(process.cwd(),'_bumblersrc/pages/'+name+'.json');
  fs.readFile(filename,'utf8',function(er,text){
    if(er){return done(er)}
    try{
      var j = JSON.parse(text);
      return done(null,j);
    }catch(e){
      return done(er);
    }
  });
}

procedures.putCustomPage = function(page,done){
  var filename = path.join(process.cwd(),'_bumblersrc/pages',page.id+'.json');
  fs.outputFile(filename,JSON.stringify(page,null,2),done);
}

procedures.deleteCustomPage = function(page,done){
  var filename = path.join(process.cwd(),'_bumblersrc/pages',page.id+'.json');
  fs.remove(filename,done);
}

procedures.getTemplate = function(done){
  return templateController.load(done);
}

procedures.setTemplate = function(template,done){
  return templateController.save(template,done);
}

// Echo is used in the admin interface to simply check if we need to redirect to the login page - i.e. if the user is authorized
procedures.echo = function(done){
  return done(null);
}

procedures.getScripts = scripts.list;
procedures.runScript = scripts.run;

///////////// end procedures //////////////////

function rpcMiddleware(req,res,next){
  const b = req.body;
  if(!b.method){
    return next(new Error('must include a rpc request method'))
  }
  if(!b.parameters){
    return next(new Error('must include rpc request parameters'))
  }
  if(!procedures[b.method]){
    return next(new Error('No such RPC method: '+b.method));
  }

  var proc = procedures[b.method];
  var params = b.parameters;

  proc(...params,function(er,result){
    // procedure threw an error
    if(er){return next(er);}

    // procedure went okay
    res.status(200);
    if(typeof result != 'undefined'){
      return res.json(result);
    }else{
      return res.json(null);
    }
  });
}

exports.procedures = procedures;
exports.middleware = rpcMiddleware;
