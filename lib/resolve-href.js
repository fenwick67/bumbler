// resolve a href
// https://www.w3.org/TR/WD-html40-970917/htmlweb.html
/*

example being if you are on http://www.google.com/search
  /admin => www.google.com/admin
  admin  => www.google.com/search/admin
  ./admin  => www.google.com/search/admin

  http://www.a.com => http://a.com
  //a.com => a.com

*/

var path = require('path');
var posix = path.posix;
const protocolRegex = /(^[\s\S]{1,20}:)(?:\/\/)/;

module.exports = function(base,href){

  if (href.length >= 2 && href[0] == '/' && href[1] == '/'){// it's a // URL.  Re-use only the protocol of the base
    return proto(base)+href;
  }
  else if ( protocolRegex.test(href) ){ // it's a http[s]:// url
    return href
  }
  else if (href.length >= 2 && href[0] == '/'){ // it's a /something url
    return join(getRoot(base),href);
  }
  else if (href.length >= 2 && href[0] == '.' && href[1] == '/'){ // it's a ./something url
    return join(base,href);
  }
  else{// it's a URL like something.jpg
    return join(base,href);
  }


}

function join(a,b){

  // remove the root from A so we can POSIX join them
  var p = proto(a);
  var start = a.replace(protocolRegex,'');

  // remove the end of hte URL /abcd/efg.html =>/abcd
  start = start.replace(/\/[^\/]+$/,'');

  return p + "//" + posix.join(start,b);

}

function getRoot(url){
  var root;

  if (protocolRegex.test(url)){
    var matches = url.match(protocolRegex);
    var protoLength = matches[0].length
    var end = url.slice(protoLength);
    var i = end.indexOf('/');
    if (i >= 0){
      end = end.slice(0,i);
    }
    return proto(url)+ '//' + end;

  }else{
    var end = url;
    var i = url.indexOf('/');
    if (i >= 0){
      end = end.slice(0,i);
    }
    return proto(url) + '//' + end;
  }
}

function proto(href){
  var base = href.match(protocolRegex);
  if (!base || !base[0] || !base[1]){
    return "http:";// IDK lmao
  }
  return base[1];
}
