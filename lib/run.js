var gulp = require('gulp');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path').posix;
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var DiskController = require('./DiskController');
var glob = require('glob');
var async = require('async');

const srcDir = '_bumblersrc'

module.exports = function(){

  // load the settings
  var settingsController = new DiskController({path:path.join(process.cwd(),'bumbler.json')});

  settingsController.load(function(er){
    if (er){ throw er}
    listen();
  });

  function listen(){

    var app = express();

    app.get('/admin/settings',settingsController.getMiddleware);
    app.post('/admin/settings',bodyParser.json(),bodyParser.urlencoded(),settingsController.postMiddleware);

    // put an asset up
    app.post('/admin/asset',fileUpload,function(req,res){
      // path comes from querystring
      var dest = req.query.path||req.query.destination||(srcDir+'/assets');
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
        file.mv(file.dest,callback);
      },function done(er){
        if (er){res.status(500);return res.send('error saving file')}
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

    // put a post in ./posts
    app.post('/admin/post',bodyParser.json(),bodyParser.urlencoded(),function(req,res){
      if (!req.body || !req.body.filename || !req.body.post){
        res.status(400);
        return res.send('did not include a valid request body')
      }
      var filename = path.join(process.cwd(),'_bumblersrc',path.parse(req.body.filename).base);
      fs.writeFile(filename,post,function(er,data){
        if (er){
          res.status(500);
          return res.send('error saving file')
        }
        res.status(200);
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
        return res.json(files);
      });

    });

    app.post('/admin/publish',function(req,res){
      // publish to github
      console.log('todo');
      res.status(500);
      return res.send('this is a todo item :)')
    })

    app.use(serveStatic(path.join(process.cwd(),'build'),{}));
    app.use(serveStatic(path.join(__dirname,'..','dev-serve'),{}));

    const port = process.env.PORT||8000;
    app.listen(port,function(){
      console.log('listening on '+port+'.  Go to localhost:'+port+'/admin to view.')
    });

  }

}
