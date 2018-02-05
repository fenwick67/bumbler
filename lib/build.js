// runs in bg and builds everything
var gulp = require('gulp');
var pug = require('gulp-pug');
var hydrate = require('./hydrate-posts.js');
var through = require('through2');
var renderPages = require('./render-pages');
var renderFavicons = require('./render-favicons')
var path = require('path');
var fs = require('fs');
const cp = require('child_process');
var async = require('async');

const srcDir = './_bumblersrc/';

var buildRequested = false;
var buildInProgress = false;

var callbacksForNextBuild = [];

function once(func){
  var spent = false;
  function delegate(...args){
    if (!spent){
      spent = true;
      return func(...args);
    }else{
      return;
    }
  }

  return delegate;
}

/*
  create a version of the async function FUNC where
  if you call it before it's done, the callback is placed in a queue
  and the async function is called once more, with that as the callback, once it finishes the .
  Used to limit the number of builds if you, say, click build a million times
  must have only one param: a callback, which just accepts an error
*/
function throttle(func){
  var inProgress = false;
  var repeatRequested = false;
  var callbacksForNextTime = [];

  function returned(cb){
    if (inProgress){
      repeatRequested = true;
      callbacksForNextTime.push(once(cb));
      return;
    }
    inProgress = true;

    // call the original function
    func(function done(er){
      inProgress=false;
      if (repeatRequested){
        repeatRequested = false;// remember this is "global"

        // create locally scoped copy of the callbacks wanted for this iteration
        var toCall = callbacksForNextTime.slice();
        callbacksForNextTime = [];
        // call throttled function again, then when done, call the callback chain.
        // if the throttled function gets called AGAIN it will have a newly scoped callback chain
        // with only the latest callbacks
        returned(function(er){
          toCall.forEach(cb=>{
            cb(er);
          });
        });
      }else{
        inProgress=false;
        repeatRequested = false;
        return cb(er);
      }
    })

  }

  return returned;

}

var buildPages = throttle(  function (cb){
  fs.readdir(path.join(srcDir,'posts/'),(er,files)=>{
    if (er) {return cb(er);}
    renderPages(files,cb);
  });

});

gulp.task('build-pages',buildPages);

// this is really CPU intensive, so run it in a subprocess
var buildFavicons = throttle(function(cb){
  var sub = cp.fork(`${__dirname}/render-favicons.js`,null,{stdio:'pipe'});

  sub.on('error',(e)=>{
    // should never happen BUT if it does...
    console.error('uhoh!  Favicon subprocess had an unhandled error!')
    return cb(e);
  })
  sub.on('message', (m) => {
    // message is the error if there is one
    return cb(m);
  });
})

gulp.task('build-favicons',buildFavicons);

gulp.task('build',gulp.series('build-pages','build-favicons'));

// watch means build, then watch
gulp.task('watch',

  gulp.series(
    'build',
    function(done){
      gulp.watch(srcDir+'*.pug',gulp.series('build-pages')),
      gulp.watch(srcDir+'favicon.*',gulp.series('build-favicons')),
      gulp.watch('./bumbler.json',gulp.series('build'))
      done();
    }
  )
);

exports.build=gulp.task('build'),
exports.watch=gulp.task('watch'),
exports.buildFavicons=gulp.task('build-favicons'),

exports.buildPages = buildPages;
