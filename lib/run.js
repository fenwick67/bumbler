var path = require('path');
var fs = require('fs-extra');
var crypto = require('crypto');

var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var glob = require('glob');
var async = require('async');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var chalk = require('chalk');
chalk.enabled = true;
var href = require('./resolve-href');
var _ = require('lodash')

var build = require('./build');
var pub = require('./publish');
var passwordManager = require('./password-manager');
var scripts = require('./scripts');
var rpcMiddleware = require('./rpcs').middleware;

var parseFormBody = bodyParser.urlencoded({extended:false});
var parseJsonBody = bodyParser.json({extended:false});

var DiskController = require('./DiskController');

var jwt = require('jsonwebtoken')
var passportJWT = require("passport-jwt");
var ExtractJwt = passportJWT.ExtractJwt;
var JwtStrategy = passportJWT.Strategy;

const srcDir = '_bumblersrc'

module.exports = function(opts){

  var opts = opts || {};

  // load the settings
  var settingsController = new DiskController({path:path.join(process.cwd(),srcDir,'bumbler.json')});

  var secret = opts.secret || opts.sessionSecret || null;

  settingsController.load(function(er){
    if (er){ throw er}
      if (!secret){
        secret = process.env['SESSIONSECRET']||process.env['SESSION_SECRET'];
      }
      if (secret && secret.length && secret.length > 1){
        listen();
      }else{
        // last ditch is load from disk, throw error if there is one
        try{
          secret = fs.readFileSync(path.join(process.cwd(),srcDir,'.sessionsecret'));
        }catch(e){
          throw e;
          process.exit(1);
        }

        listen();
      }
  });

  function listen(){

    var app = express();

    // serve static files

    app.use(serveStatic(process.cwd(),{dotfiles:'deny'}));



    var jwtOptions = {
      jwtFromRequest : ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey : secret,
      algorithms:['HS512']
    }

    // where the magic happens
    passport.use(new JwtStrategy(jwtOptions,function(payload, done) {
        // it's fine
        return done(null,payload);
      }
    ));

    var ensureAuthenticated = passport.authenticate('jwt', { session: false });

    app.use(passport.initialize());
    app.post('/login',parseJsonBody,function(req,res){
      var username;
      var password;
      if(req.body.username && req.body.password){
        var username = req.body.username;
        var password = req.body.password;
      }
      console.log(req.body.password)

      passwordManager.check(password,function(er,ok){
        if(er){
          res.status(500)
          res.send('error authenticating, please try again '+er)
        }else{
          if(ok){
            var payload = {admin:true,username:username}
            var token = jwt.sign(payload, jwtOptions.secretOrKey,{algorithm:'HS512'})
            res.status(200)
            res.json({token: token})
          }else{
            res.status(401)
            res.send("Incorrect Login")
          }
        }
      });

    });


    // put an asset up
    app.post('/admin/asset',ensureAuthenticated,fileUpload(),function(req,res){
      // path comes from querystring
      //console.log('posted upload');
      var dest = req.query.path||req.query.destination||('_bumblersrc/assets');
      if (!req.files){
        res.status(400);
        return res.send('no files!')
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

    app.get(['/admin','/admin/index.html','/admin/'],function(req,res,next){
      if (req.path != '/admin/'){
        return res.redirect('/admin/');
      }
      res.sendFile(path.join(__dirname,'..','dev-serve/admin/index.html'),{},function(er){
        if (er){
          next(er);
        }
      });
    });

    app.post('/admin/rpc',ensureAuthenticated,parseJsonBody,rpcMiddleware);

    app.get('/.well-known/webfinger',function(req,res){

      res.setHeader('Access-Control-Allow-Origin','*')

      if (req.query && req.query.resource){
        var subject = req.query.resource;
        if (subject.toLowerCase().indexOf('acct') == 0){ // for any "account" on this site
          var siteInfo = settingsController.get();
          var result = {
            "subject" : subject,
            "links" :[
              {
                "rel" : "http://webfinger.net/rel/avatar",
                "href" : href(siteInfo.siteUrl,siteInfo.avatar)
              },
              {
                "rel" : "http://webfinger.net/rel/profile-page",
                "href" : href(siteInfo.siteUrl,'/')
              },
              {
                "rel":"http://schemas.google.com/g/2010#updates-from",
                "type":"application/atom+xml",
                "href":href(siteInfo.siteUrl,'/atom.xml')
              }
            ]
           }
           res.status(200);
           res.json(result);

        }else{ // not an account.  No info for u
          res.status(404);
          res.send('not found')
        }
      }else{
        res.status(400);
        res.send('bad request (include a resource identifier)')
      }

    })

    app.use(serveStatic(path.join(__dirname,'../dev-serve'),{dotfiles:'deny'}));



    const port = opts.port||process.env.PORT||8000;

    app.listen(port,opts.local?'localhost':'0.0.0.0',function(){
      console.log(chalk.bold.green('listening on '+port+'.  Go to localhost:'+port+'/admin to view.'))
      build.build();
      build.watch();
    });

  }

}
