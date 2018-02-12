const api = require('./rpc').api;
var each = require('lodash/each')

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
      each(types,(extensions,key)=>{
        each(extensions,extension=>{
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
    var split = this.href.split('/');
    var filename = split[split.length - 1];
    api.deleteAsset(filename,callback)

  }
}

Asset.prototype.fetchAll = function(callback){
  return api.getAssets(callback);
}

module.exports = Asset;
