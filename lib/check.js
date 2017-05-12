var fs = require('fs')
var path = require('path');

module.exports = function(){
  JSON.parse(fs.readFileSync(path.join(process.cwd(),'bumbler.json')));
}
