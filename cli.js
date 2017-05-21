#!/usr/bin/env node

var init = require('./lib/init');
var argv = require('yargs').argv;
var run = require('./lib/run');
var hash = require('./lib/hash');
var opn = require('opn');

var cmd = argv._[0];

var help = `BUMBLER: the easy self-hosted microblog.

USAGE:
  bumbler init   => initialize your microblog
  bumbler help   => show this
  bulmblr hash   => create password login info
  bumbler [opts] => run the editor / builder
          |
          --open => open it in a web browser when starting, for convenience
  `

if (argv.help || argv.h || (cmd && cmd.toLowerCase() == 'help') ){
  console.log(help);
  process.exit(0);
}

if (cmd && cmd.toLowerCase() == 'init'){
  init();
}else if (cmd && cmd.toLowerCase() == 'hash'){
  hash();
}else{
  if (argv.open || argv.o){
    opn('http://localhost:'+(process.env.PORT||8000)+'/admin' );
  }
  run();

}
