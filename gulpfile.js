// compile pug and everything for development
var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var browserify = require('browserify');
var babelify = require('babelify');
var fs = require('fs');
var envify = require('envify/custom');

var UglifyJS = require("uglify-js");

gulp.task('pug',function(){
  return gulp.src('./dev-src/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./dev-serve'));
})

gulp.task('browserify', function(done) {
    browserify('./dev-src/admin/app.js')
      //.plugin('tinyify',{flat:false})
      .transform(babelify)
      .bundle(function(er,buf){
        if(er){throw er}
        fs.writeFile('./dev-serve/admin/app.js',buf,done)
      });
});

gulp.task('browserify-prod',function(done){
  browserify('./dev-src/admin/app.js')
    .transform(
      // Required in order to process node_modules files
      { global: true },
      envify({ NODE_ENV: 'production' })
    )
    .transform(babelify)
    .bundle(function(er,buf){
      if(er){throw er}

      var res = UglifyJS.minify(buf.toString('utf8'));
      fs.writeFile('./dev-serve/admin/app.js',res.code,done)

    });
})

gulp.task('sass', function () {
  return gulp.src('./dev-src/**/*.scss')
    .pipe(sass({includePaths:['node_modules/bulma','node_modules/buefy','node_modules','node_modules/buefy/src','node_modules/buefy/src/scss']}).on('error', sass.logError))
    .pipe(gulp.dest('./dev-serve'));
});

gulp.task('prod',gulp.series('sass','pug','browserify-prod'));
gulp.task('dist',gulp.series('prod'))
gulp.task('default',gulp.series('sass','pug','browserify'));

gulp.task('watch',
  gulp.series('default',
    function(done){
      gulp.watch('./dev-src/**/*.pug',gulp.task('pug'))
      gulp.watch('./dev-src/**/*.scss',gulp.task('sass'))
      gulp.watch('./dev-src/**/*.js',gulp.task('browserify'))
      done(null)
    }
  )
);
