var path = require('path');
var fs = require('fs');

var gulp = require('gulp');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var glob = require('glob');
var async = require('async');
var build = require('./build');
var chalk = require('chalk');
chalk.enabled = true;

var parseFormBody = bodyParser.urlencoded({extended:false});
var parseJsonBody = bodyParser.json({extended:false});

var DiskController = require('./DiskController');

const srcDir = '_bumblersrc'

module.exports = function(){

  // load the settings
  var settingsController = new DiskController({path:path.join(process.cwd(),'bumbler.json')});
  var htmlController = new DiskController({path:path.join(process.cwd(),'_bumblersrc/layout.pug'),isText:true});

  settingsController.load(function(er){
    if (er){ throw er}
    htmlController.load(function(er){
      if (er){ throw er}
      listen();
    })
  });

  function listen(){

    var app = express();

    app.use(serveStatic(process.cwd()));
    app.use(serveStatic(path.join(__dirname,'..','dev-serve'),{}));

    app.get('/admin/settings',settingsController.getMiddleware());
    app.post('/admin/settings',parseFormBody,parseJsonBody,settingsController.postMiddleware());

    app.get('/admin/html',htmlController.getMiddleware());
    app.post('/admin/html',parseFormBody,parseJsonBody,htmlController.postMiddleware());

    // put an asset up
    app.post('/admin/asset',fileUpload(),function(req,res){
      // path comes from querystring
      console.log('posted upload');
      var dest = req.query.path||req.query.destination||('/assets');
      if (!req.files){
        res.status(400);
        res.send('no files!')
      }
      // array of files
      var files = Object.keys(req.files).map(function(k){
        return {
          file:req.files[k],
          dest:req.query.filename?path.join(process.cwd(),req.query.filename):path.join(process.cwd(),dest,req.files[k].name)
        };
      });

      async.each(files,function iterator(file,callback){
        file.file.mv(file.dest,callback);
      },function done(er){
        if (er){
          console.error(er);
          res.status(500);
          return res.send(er)
        }
        res.status(200);
        // get filenames to return to client
        var ret = files.map( function(file){
          return {
            name:file.file.name,
            href:file.dest.replace(srcDir+'/','')
           }
        });

        return res.json(ret);
      });
    });

    // put a post into ./posts
    app.post('/admin/post',parseJsonBody,function(req,res){
      if (!req.body){
        res.status(400);
        return res.send('did not include a valid request body')
      }
      var post = req.body;
      console.log(post);
      // TODO: validate


      var filename = path.join(process.cwd(),'_bumblersrc/posts',post.id+'.json');
      fs.writeFile(filename,JSON.stringify(post,null,2),function(er,data){
        if (er){
          res.status(500);
          return res.send('error saving file')
        }
        res.status(200);
        build.build();
        return res.send();
      });
    });

    app.get('/admin/glob',function(req,res){
      var pattern = req.query.pattern;
      if (!pattern){
        res.status(400);
        return res.send('you forgot the <pattern> parameter in the querystring')
      }
      glob(pattern,function(er,files){
        if (er){
          res.status(500);
          return res.send(er)
        }
        res.status(200);
        var files = files.map(function(f){return f.replace('./','/')});
        return res.json(files);
      });

    });

    // trigger a build
    app.post('/admin/build',function(req,res){
      console.log('build triggered from page');
      build.build();
      res.status(200);
      return res.send('ok')
    })

    app.post('/admin/publish',function(req,res){
      // publish to github
      console.log('todo');
      res.status(500);
      return res.send('this is a todo item :)')
    })

    const port = process.env.PORT||8000;
    app.listen(port,function(){
      console.log(chalk.bold.green('listening on '+port+'.  Go to localhost:'+port+'/admin to view.'))
      build.build();
      build.watch();
    });

  }

}
