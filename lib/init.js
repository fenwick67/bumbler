/*
// make directory 'build' and file 'bumbler.json'
// create bumbler.json
// init git repo
*/


var fs = require('fs');
var path = require('path')
var readline = require('readline');

var async = require('async');
var _ = require('lodash');
var chalk = require('chalk');
chalk.enabled = true;

var pub = require('./publish')

var cwd = process.cwd();

module.exports = function(){

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
    '_bumblersrc/plugins',
    'page',
    'post'
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
    metadata:"{}",
    title:dir,
    postsPerPage:'10',
    publishBranch: "",
    publishUrl: ""
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

  var questions = [
    ["title","What is the title of the site?"],
    ["description","What is your site about?"],
    ['postsPerPage','How many posts do you want on each page?'],
    ['avatar',"What is your avatar\'s URL?"],
    ["authorName","What is your username / handle?"]
    ['siteUrl','What is the URL of the site going to be? (format it like '+chalk.bright('http://mysite.info/')+' )']
  ]

  async.eachSeries(questions,function(question,done){
    q(question[0],question[1],done)
  },function(er){
    if (er){throw er}

    var toWrite = JSON.stringify(_.extend({},defaultJson,json),null,2);

    var pug = fs.readFileSync(path.join(__dirname,'..','defaults','layout.pug'),'utf8');
    fs.writeFileSync(path.join(cwd,'_bumblersrc','layout.pug'),pug);

    fs.writeFileSync(path.join(cwd,'bumbler.json'),JSON.stringify(json,null,2));

    console.log('ok!  Now run '+chalk.cyan('bumbler')+' to start writing!');
  })

}
