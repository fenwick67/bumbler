// compile pug and everything for development
var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var source = require('vinyl-source-stream');

var browserify = require('browserify');

gulp.task('pug',function(){
  return gulp.src('./dev-src/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./dev-serve'));
})

gulp.task('browserify', function() {
    return browserify('./dev-src/private/admin/app.js')
      .bundle()
      //Pass desired output filename to vinyl-source-stream
      .pipe(source('app.js'))
      // Start piping stream to tasks!
      .pipe(gulp.dest('./dev-serve/private/admin'));
});


gulp.task('sass', function () {
  return gulp.src('./dev-src/**/*.scss')
    .pipe(sass({includePaths:'node_modules/bulma'}).on('error', sass.logError))
    .pipe(gulp.dest('./dev-serve'));
});

gulp.task('default',['sass','pug','browserify']);

gulp.task('watch',['default'],function(){
   gulp.watch('./dev-src/**/*.pug',['pug'])
   gulp.watch('./dev-src/**/*.scss',['sass'])
   gulp.watch('./dev-src/**/*.js',['browserify'])
})
