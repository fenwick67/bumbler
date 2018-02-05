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

function buildPages(cb){
  // build this maff
  fs.readdir(path.join(srcDir,'posts/'),(er,files)=>{
    if (er) {return cb(er)}
    renderPages(files,cb);
  });

}

gulp.task('build-pages',buildPages);

// this is really CPU intensive, so run it in a subprocess
function buildFavicons(cb){
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
