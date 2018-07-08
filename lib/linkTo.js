/*

get a href to relevant URL on the site

'root'
'feed'[,n]
'admin'
'page',n
'tag','apples'[,n]

*/

module.exports = function(...args){

  if (args[0] == 'root'){
    return '/index.html';
  }
  else if(args[0] == 'page'){
    var n = args[1] || 1;
    return `/page/${n}.html`;
  }
  else if(args[0] == 'tag'){
    var n = args[1] || 'index';
    return `/tag/${args[0]}/${n}.html`;
  }
  else if (args[0] == 'feed'){
    if (!args[1] || args[1].toString() == '1'){
      return '/atom/feed.xml'
    }
    return `/atom/${args[1]}.xml`
  }
  else if (args[0] == 'admin'){
    return '/admin'
  }
  return '/index.html';

}
