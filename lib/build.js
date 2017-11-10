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

gulp.task('build-pages',[],function(cb){
  // build this maff
  fs.readdir(path.join(srcDir,'posts/'),(er,files)=>{
    if (er) {return cb(er)}
    renderPages(files,cb);
  });

});

// this is really CPU intensive, so run it in a subprocess
gulp.task('build-favicons',[],function(cb){
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


});

var build = gulp.task('build',['build-pages','build-favicons']);

// watch means build, then watch
var watch = gulp.task('watch',['build'],function(){
  gulp.watch(srcDir+'*.pug',['build-pages']);
  gulp.watch(srcDir+'favicon.*',['build-favicons']);
  gulp.watch('./bumbler.json',['build']);
});

module.exports = {
  build:function(){gulp.start('build')},
  watch:function(){gulp.start('watch');console.log('watching for changes');},
  buildFavicons:function(){console.log('building favicons');gulp.start('build-favicons');},
  buildPages:function(){gulp.start('build-pages')}
}
