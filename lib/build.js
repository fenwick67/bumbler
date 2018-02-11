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


/*
  build are queued
*/

var buildQueue = async.queue(function(task,done){
  // task is in our case...
  // {}
  // and the action to perform is to build
  fs.readdir(path.join(srcDir,'posts/'),(er,files)=>{
    if (er) {
      return done(er);
    }
    renderPages(files,done);
  });

},1);


var buildPages = function(callback){
  buildQueue.push({},callback);
}

gulp.task('build-pages',buildPages);

var faviconQueue = async.queue(function(task,done){
  // task is in our case...
  // {}
  // and the action to perform is to build favicons

  var sub = cp.fork(`${__dirname}/render-favicons.js`,null,{stdio:'pipe'});

  sub.on('error',(e)=>{
    // should never happen BUT if it does...
    console.error('uhoh!  Favicon subprocess had an unhandled error!')
    return done(e);
  });

  sub.on('message', (m) => {
    // message is the error if there is one
    return done(m);
  });

},1)

// this is really CPU intensive, so run it in a subprocess
var buildFavicons = function(callback){
  faviconQueue.push({},callback);
}

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
