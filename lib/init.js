/*
// make directory 'build' and file 'bumbler.json'
// create bumbler.json
// init git repo
*/

var pub = require('./publish')

module.exports = function(){

  var fs = require('fs');
  var cwd = process.cwd();
  var path = require('path')
  var readline = require('readline');
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  //make dirs
  var dirs = [
    '_bumblersrc',
    'assets',
    '_bumblersrc/posts',
    '_bumblersrc/hydrated-posts',
    '_bumblersrc/plugins'
  ];

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
    title:dir,
    postsPerPage:10
  }
  var json = {};

  // ask user for input, default to defaultJson value or ""
  function q(prop,question,cb){
    var ask = question + (defaultJson[prop]?' ('+defaultJson[prop]+')':'');
    rl.question(ask,res=>{
      if (!res && defaultJson[prop] !== null){
        json[prop]=defaultJson[prop];
        cb(null);
      }else if (!res){
        // do again
        console.log('this is a required value');
        q(prop,question,cb);
      }else{
        cb(null);
      }

    })
  }



  q('title','What is the title of this site?',er=>{
    q('postsPerPage','How many posts do you want on each page?',er=>{
      var pug = fs.readFileSync(path.join(__dirname,'..','defaults','layout.pug'),'utf8');
      fs.writeFileSync(path.join(cwd,'bumbler.json'),JSON.stringify(json,null,2));

      fs.writeFileSync(path.join(cwd,'_bumblersrc','layout.pug'),pug);

      // prep git
      console.log('prepping git repo...')
      pub.init(er=>{
        if (er){porocess.exit(1)}
        console.log('ok!  Now run bumbler to start writing!');
      })

    });
  });

}
