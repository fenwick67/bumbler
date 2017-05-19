// render atom feed
var feed = require('feed');
var moment = require('moment');
var ejs = require('ejs');
var mime = require('mime-types');
var fs = require('fs');
var path = require('path')

var template = fs.readFileSync(path.join(__dirname,'lib/atomtemplate.ejs'),'utf8');
