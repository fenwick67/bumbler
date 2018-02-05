// compile pug and everything for development
var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var babelify = require('babelify')
var fs = require('fs')

gulp.task('pug',function(){
  return gulp.src('./dev-src/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./dev-serve'));
})

gulp.task('browserify', function(done) {
    browserify('./dev-src/admin/app.js')
      .transform(babelify)
      .bundle(function(er,buf){
        fs.writeFile('./dev-serve/admin/app.js',buf,done)
      });
});


gulp.task('sass', function () {
  return gulp.src('./dev-src/**/*.scss')
    .pipe(sass({includePaths:['node_modules/bulma','node_modules/simplemde-theme-dark/src','node_modules/simplemde-theme-base/src']}).on('error', sass.logError))
    .pipe(gulp.dest('./dev-serve'));
});

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
