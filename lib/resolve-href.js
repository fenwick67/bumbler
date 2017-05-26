// resolve a href
// https://www.w3.org/TR/WD-html40-970917/htmlweb.html
/*

omg this is a node module?  What am I doing with my life.

*/

var url = require('url');

module.exports = function(base,href){
  return url.resolve(base,href);
}
