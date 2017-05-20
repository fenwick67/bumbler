// render atom feed
var feed = require('feed');
var moment = require('moment');
var ejs = require('ejs');
var mime = require('mime-types');
var fs = require('fs');
var path = require('path')
var _ = require('lodash')

var atom = fs.readFileSync(path.join(__dirname,'/atomtemplate.ejs'),'utf8');
var template = ejs.compile(atom,{rmWhitespace :true});

module.exports = function(locals){
  return template(_.extend({},{mime},locals));
}
