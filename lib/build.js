// runs in bg and builds everything
var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var hydrate = require('./hydrate-posts.js');
var through = require('through2');
var Metalsmith = require('metalsmith');
var renderPages = require('./render-pages')
var path = require('path')

const srcDir = './_bumblersrc/';

function hydrator(opts){
  var opts = opts || {};
  const name = "post-hydrator"

  // Creating a stream through which each file will pass
  return through.obj(function(file, enc, cb) {
    if (file.isNull()) {
      // return empty file
      return cb(null, file);
    }
    if (file.isBuffer()) {
      // transform it
      var jsonStr = file.contents.toString();
      var json = {};

      try{
        json = JSON.parse(jsonStr);
      }catch(e){
        console.error('error parsing post JSON');
        throw e;
      }

      try{
        json = hydrate(json);
      }catch(e){
        console.error('error hydrating post JSON');
        throw e;
      }

      file.contents = Buffer.from(JSON.stringify(json));
    }
    if (file.isStream()) {
      // emit an error
      this.emit("error",new Error(": hydrator doesn't support streams so DWI") )
    }

    cb(null, file);
  });
}


/*
chain:
  post srcs => hydrated sources in a temp dir
  post srcs + template => posts/postID.html
  post srcs + template => page/n
  post srcs + template => index.html
*/

gulp.task('hydrate',function(){
  return gulp.src(srcDir+'posts/*.json')
    .pipe(hydrator())
    .pipe(gulp.dest(srcDir+'hydrated-posts/'));
});

gulp.task('build-pages',['hydrate'],function(cb){
  // Metalsmith this maff
  Metalsmith(process.cwd())
    .clean(false)
    .source(path.join('_bumblersrc','hydrated-posts'))
    .destination('./')
    .use(renderPages)
    .build(cb);

});

var build = gulp.task('build',['hydrate','build-pages']);

var watch = gulp.task('watch',['build'],function(){
  gulp.watch(srcDir+'*.pug',['build']);
  gulp.watch(srcDir+'posts/*',['build']);
});

module.exports = {
  build:function(){gulp.start('build')},
  watch:function(){gulp.start('watch');console.log('watching for changes');}
}
