// runs in bg and builds everything
var gulp = require('gulp');
var pug = require('gulp-pug');
var hydrate = require('./hydrate-posts.js');
var through = require('through2');
var Metalsmith = require('metalsmith');
var renderPages = require('./render-pages');
var path = require('path');
var fs = require('fs');
var async = require('async');

const srcDir = './_bumblersrc/';

gulp.task('build-pages',[],function(cb){
  // Metalsmith this maff
  fs.readdir(path.join(srcDir,'hydrated-posts/'),(er,files)=>{
    if (er) {return cb(er)}
    renderPages(files,cb);
  });

});

var build = gulp.task('build',['build-pages']);

var watch = gulp.task('watch',['build'],function(){
  gulp.watch(srcDir+'*.pug',['build']);
  gulp.watch(srcDir+'*.pug',['build']);
  gulp.watch('./bumbler.json',['build']);
});

module.exports = {
  build:function(){gulp.start('build')},
  watch:function(){gulp.start('watch');console.log('watching for changes');}
}
