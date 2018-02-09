#!/usr/bin/env node

var init = require('./cli-lib/init');
var argv = require('yargs').argv;
var run = require('./lib/run');
var hash = require('./cli-lib/hash');
var opn = require('opn');
var nginx = require('./cli-lib/nginx');
var cmd = argv._[0];
var build = require('./lib/build')

var help = `BUMBLER: the easy self-hosted microblog.

This program is free software: you can redistribute it and/or modify 
it under the terms of the GNU General Public License as published by 
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

If you did not receive or cannot find the source code, you can obtain it by visiting https://github.com/fenwick67/bumbler .
---------------------------------------------------------------------
USAGE:
  bumbler help   => show this
  bumbler init   => initialize your microblog
  bumbler nginx  => writes out an example NGINX config if you blog is in the current working directory.
  bumbler pm2    => writes out an example PM2 "process.yml" file to use with PM2.
  bumbler hash   => create password login info
  bumbler build  => just build and exit

  bumbler [opts] => run the CMS system and builder
          │
          --open, -o      => open it in a web browser when starting, for convenience
          --local         => listen on localhost instead of 0.0.0.0
          --port [number] => listen on a specific port.  Alternatively, supply a PORT environment variable to set this.



  The Authors recommend making a dir, "cd" into it, then run "bumbler init" then "bumbler" for easy setup.

  For better performance, set up NGINX.  Run "bumbler nginx" to get that set up.

  `

if (argv.help || argv.h || (cmd && cmd.toLowerCase() == 'help') ){
  console.log(help);
  process.exit(0);
}

if (cmd && cmd.toLowerCase() == 'build'){
  build.build();
}else if (cmd && cmd.toLowerCase() == 'init'){
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
  console.log(argv);
  var p = argv.port||process.env.PORT||process.env.port||8000;
  var l = argv.local||false;

  if (argv.open || argv.o){
    opn('http://localhost:'+p+'/admin' );
  }

  run({port:p,local:l});

}
