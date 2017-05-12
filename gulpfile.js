// compile pug and everything for development
var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');

gulp.task('pug',function(){
  return gulp.src('./dev-src/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('./dev-serve'));
})

gulp.task('sass', function () {
  return gulp.src('./dev-src/**/*.scss')
    .pipe(sass({includePaths:'node_modules/bulma'}).on('error', sass.logError))
    .pipe(gulp.dest('./dev-serve'));
});

gulp.task('default',['sass','pug'])
