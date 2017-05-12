/*
// make directory 'build' and file 'bumbler.json'
// create bumbler.json
*/

module.exports = function(){

  var fs = require('fs');
  var cwd = process.cwd();
  var path = require('path')
  var readlineSync = require('readline-sync');


  //make dirs
  var dirs = ['_bumblersrc','_bumblersrc/assets','_bumblersrc/posts','_bumblersrc/plugins'];

  dirs.forEach(function(dir){
    var href=path.join(cwd,dir);
    try{
      fs.accessSync(href);
    }
    catch(e){
      fs.mkdirSync(path.join(cwd,dir))
    }
  });

  // create json
  var dir = path.parse(process.cwd()).name;
  var defaultJson = {
    "name":dir
  }
  var json = {};

  // ask user for input, default to defaultJson value or ""
  function q(prop,question){
    var ask = question + (defaultJson[prop]?' ('+defaultJson[prop]+')':'');
    var res = readlineSync.question(ask);
    if (!res && typeof defaultJson[prop] == 'string'){
      json[prop]=defaultJson[prop];
    }else{
      // do again
      console.log('this is a required value');
      q(prop,question);
    }
  }

  q('name','What is the name of this project?');

  fs.writeFileSync(path.join(cwd,'bumbler.json'),JSON.stringify(json,null,2));

  console.log('ok!  Now run bumbler to start writing!');

}
