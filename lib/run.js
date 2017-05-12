var gulp = require('gulp');
var express = require('express');
var serveStatic = require('serve-static');
var path = require('path');
var check = require('./check');

module.exports = function(){

try{
  check();
}catch(e){
  console.log('error with bumbler.json: '+e);
  process.exit(1);
}

listen();

function listen(){

  var app = express();

  app.use(serveStatic(path.join(process.cwd(),'build'),{}));
  app.use(serveStatic(path.join(__dirname,'..','dev-serve'),{})); 

  const port = process.env.PORT||8000;
  app.listen(port,function(){
    console.log('listening on '+port+'.  Go to localhost:'+port+'/admin to view.')
  });

}

}
