var _ = require('lodash');


// Asset that has been uploaded
// has a href and a type
class Asset{
  constructor(href,type){
    // type optional
    function getExtension(href){
      var s = href.split('.');
      return s[s.length - 1];
    }
    function getTypeForExtension(ext){
      var x = ext.toLowerCase();
      var type = 'unknown'
      var types = {
        'audio':['mp3','wav','ogg'],
        'video':['mp4'],
        'image':['png','gif','bmp','svg','tif','jpg','jpeg']
      }
      _.each(types,(extensions,key)=>{
        _.each(extensions,extension=>{
          if (x == extension){
            type=key;
            return false;
          }
        })
      });

      return type;

    }
    this.href = href;
    this.type = type || getTypeForExtension(getExtension(href));
  }

  delete(callback){

    var cb = callback || function(){};
    var filename = _.last(this.href.split('/'));
    var ok = false;
    fetch('/admin/asset?filename='+filename,{method:"DELETE",credentials:'include'}).then(response=>{
      ok = response.ok;
      return response.text();
    }).then(text=>{
      return cb(ok?null:new Error(text));
    }).catch(error=>{
      return cb(error);
    });

  }
}

Asset.prototype.fetchAll = function(callback){

  var ok = false;
  fetch('/admin/glob?pattern='+encodeURIComponent('./assets/*'),{credentials: "include"}).then(response=>{
    ok = response.ok;
    if (ok){
      return response.json();
    }else{
      return response.text();
    }
  }).then(data=>{
    if (ok){
      var assets = [];
      data.forEach(file=>{
        assets.push(new Asset(file));
      });
      callback(null,assets)
    }else{
      // data is response text
      callback(data)
    }

  });
}

module.exports = Asset;
