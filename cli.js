#!/usr/bin/env node

var init = require('./cli-lib/init');
var argv = require('yargs').argv;
var run = require('./lib/run');
var hash = require('./cli-lib/hash');
var opn = require('opn');
var nginx = require('./cli-lib/nginx');
var cmd = argv._[0];

var help = `BUMBLER: the easy self-hosted microblog.

USAGE:
  bumbler help   => show this
  bumbler init   => initialize your microblog
  bumbler nginx  => writes out an example NGINX config if you blog is in the current working directory.
  bumbler pm2    => writes out an example PM2 "process.yml" file to use with PM2.
  bulmblr hash   => create password login info
  bumbler [opts] => run the editor / builder
          |
          --open, -o      => open it in a web browser when starting, for convenience
          --local         => listen on localhost instead of 0.0.0.0
          --port [number] => listen on a specific port.  Alternatively, supply a PORT environment variable to set this.


  The author recommends making a dir, "cd" into it, then run "bumbler init" then "bumbler" for easy setup.

  For better performance, set up NGINX.  Run "bumbler nginx" to get that set up.

  `

if (argv.help || argv.h || (cmd && cmd.toLowerCase() == 'help') ){
  console.log(help);
  process.exit(0);
}

if (cmd && cmd.toLowerCase() == 'init'){
  init();
}else if (cmd && cmd.toLowerCase() == 'nginx'){
  nginx(e=>{
    if(e){throw e}
    process.exit(0);
  });
}else if (cmd && cmd.toLowerCase() == 'hash'){
  hash(e=>{
    if (e){throw e}
    process.exit(0);
  });
}else{
  var p = argv.port||process.env.PORT||process.env.port||8000;
  var l = argv.local||false;
  
  if (argv.open || argv.o){
    opn('http://localhost:'+p+'/admin' );
  }
  
  run({port:p,local:l});

}
