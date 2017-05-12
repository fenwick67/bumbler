#!/usr/bin/env node

var init = require('./lib/init');
var argv = require('yargs').argv;
var run = require('./lib/run');

var cmd = argv._[0];

if (cmd == 'init'){

  init();

}else{

  run();

}

