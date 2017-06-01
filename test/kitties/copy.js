var fs = require('fs');
var _ = require('lodash');
var filenames = fs.readdirSync('./_bumblersrc/posts/')
var uuid = require('uuid').v1;

for (var i = 0; i < 10000; i++){
  var j = JSON.parse(fs.readFileSync('./_bumblersrc/posts/'+_.sample(filenames),'utf8'));
  var u = uuid();
  j.id = u;
  fs.writeFileSync('./_bumblersrc/posts/'+u+'.json',JSON.stringify(j,null,2));

} 
