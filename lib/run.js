var path = require('path');
var fs = require('fs');
var crypto = require('crypto');

var gulp = require('gulp');
var express = require('express');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');
var glob = require('glob');
var async = require('async');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var session = require('express-session')
var chalk = require('chalk');
chalk.enabled = true;
var href = require('./resolve-href');

var build = require('./build');
var pub = require('./publish')
var passwordManager = require('./password-manager')

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

    // serve static files

    app.use(serveStatic(process.cwd(),{dotfiles:'deny'}));

    function ensureAuthenticated(req,res,next){
      if (req.isAuthenticated()){
        return next();
      }else{
        res.status(401);
        res.send();
      }
    }

    function ensureAuthenticatedRedirect(req,res,next){
      if (req.isAuthenticated()){
        return next();
      }else{
        res.redirect('/login');
      }
    }

    passport.serializeUser(function(user, done) {
      done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
      return done(null,{id:id});
    });

    // where the magic happens
    passport.use(new LocalStrategy(
      function(username, password, done) {
        passwordManager.check(password,function(er,ok){
          if (er) {
            return done(er);
          }
          if (!ok){
            return done( null,false,{message:'bad password'} )
          }
          return done(null,{id:'admin'});
        })
      }
    ));


    // use in-memory session store with a random secret
    app.use(session({ secret: process.env.sessionsecret || crypto.randomBytes(256).toString('utf8'), resave:true, saveUninitialized:true }));
    app.use(passport.initialize());
    app.use(passport.session());



    app.post('/login',
      parseFormBody,
      passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login?failure',
        failureFlash: false
      }),function(req,res){
        //console.log(req.user);
      }
    );

    // everything below this will need to be authenticated

    app.get('/admin/settings',ensureAuthenticated,settingsController.getMiddleware());
    app.post('/admin/settings',ensureAuthenticated,parseFormBody,parseJsonBody,settingsController.postMiddleware());

    app.get('/admin/html',ensureAuthenticated,htmlController.getMiddleware());
    app.post('/admin/html',ensureAuthenticated,parseFormBody,parseJsonBody,htmlController.postMiddleware());

    // put an asset up
    app.post('/admin/asset',ensureAuthenticated,fileUpload(),function(req,res){
      // path comes from querystring
      //console.log('posted upload');
      var dest = req.query.path||req.query.destination||('/assets');
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

    // put a post into ./posts
    app.post('/admin/post',ensureAuthenticated,parseJsonBody,function(req,res){
      if (!req.body){
        res.status(400);
        return res.send('did not include a valid request body')
      }
      var post = req.body;
      //console.log(post);
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

    app.get('/admin/glob',ensureAuthenticated,function(req,res){
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
    app.post('/admin/build',ensureAuthenticated,function(req,res){
      console.log('build triggered from page');
      build.build();
      res.status(200);
      return res.send('ok')
    })

    app.post('/admin/publish',ensureAuthenticated,function(req,res){
      // publish to github

      res.status(500);
      return res.send('this is a work in progress feature')

      pub.publish(er=>{
        if(er){
          res.status(500);
          return res.send(er);
        }
        res.status(200);
        return res.send('');
      })
    });

    app.post('/admin/gitinit',ensureAuthenticated,function(req,res){
      // re-init repo with the remote set up
      var url = settingsController.get().publishUrl;
      pub.init(er=>{
        if(er){res.status(500);return res.send(er);}
        pub.addRemote(url,er2=>{
          if(er2){
            // try setting remote instead of adding
            pub.setRemote(url,done);
          }
          done(null);
        });
      });

      function done(er){
        if(er){res.status(500);return res.send(er);}
        res.status(200);
        res.send('')
      }

    });


    app.get(['/admin','/admin/index.html','/admin/'],ensureAuthenticatedRedirect,function(req,res,next){
      if (req.path != '/admin/'){
        return res.redirect('/admin/');
      }
      res.sendFile(path.join(__dirname,'..','dev-serve/admin/index.html'),{},function(er){
        if (er){
          next(er);
        }
      });
    });

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



    const port = process.env.PORT||8000;
    app.listen(port,function(){
      console.log(chalk.bold.green('listening on '+port+'.  Go to localhost:'+port+'/admin to view.'))
      build.build();
      build.watch();
    });

  }

}
