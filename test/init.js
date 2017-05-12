// run the init script

var init = require('../lib/init');
var fs = require('fs');
var path = require('path');

init();

// now check that dirs were made here
var dirs = ['_bumblersrc'];
var files = ['bumbler.json'];

var cwd = process.cwd();

dirs.forEach(function(dir){
  if (!fs.statSync(path.join(cwd,dir)).isDirectory()){
    throw new Error('could not find dir: '+dir);
  }
});

files.forEach(function(file){
  var filename = path.join(cwd,file);
  if (!fs.statSync(filename).isFile()){
    throw new Error('could not find file: '+filename);
  }
});
