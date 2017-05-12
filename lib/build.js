// runs in bg and builds everything
var gulp = require('gulp');
var sass = require('gulp-sass');
var pug = require('gulp-pug');
var watch = require('gulp-watch')
var path = require('path.posix');

const srcDir = '_bumblersrc';

/*
chain:
  move assets over
  post srcs => (temporary) post htmls
  post htmls => posts/postID.html
  post htmls => page/n
  post htmls => index.html
*/

module.exports = watchPug;
