var gulp = require('gulp');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var DiskController = require('./DiskController');
var async = require('async');

module.exports = function(){

  // load the settings
  var settingsController = new DiskController({path:path.join(process.cwd(),'bumbler.json')});

  settingsController.load(function(er){
    if (er){ throw er}
    listen();
  });

  function listen(){

    var app = express();

    app.use(serveStatic(path.join(process.cwd(),'build'),{}));
    app.use(serveStatic(path.join(__dirname,'..','dev-serve'),{}));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded());

    app.get('/admin/settings',settingsController.getMiddleware);
    app.post('/admin/settings',settingsController.postMiddleware);

    app.post('/admin/upload',fileUpload,function(req,res){
      // path comes from querystring
      var dest = req.query.path||req.query.destination||'';
      if (!req.files){
        res.status(400);
        res.send('no files!')
      }
      async.each(req.files,function iterator(file,callback){
        var destFilename = req.query.filename?path.join(process.cwd(),req.query.filename):path.join(process.cwd(),dest,file.name);
        file.mv(destFilename,callback)
      },function done(er){
        if (er){res.status(500);return res.send('error saving file')}
        res.status(200);
        return res.send();
      })
    })

    app.post('/admin/publish',function(req,res){
      // publish to github
      console.log('todo');
      res.status(500);
      return res.send('this is a todo item :)')
    })

    const port = process.env.PORT||8000;
    app.listen(port,function(){
      console.log('listening on '+port+'.  Go to localhost:'+port+'/admin to view.')
    });

  }

}
