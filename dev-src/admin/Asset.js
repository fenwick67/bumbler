var _ = require('lodash');
const api = require('./rpc').api;


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
    api.deleteAsset(filename,callback)

  }
}

Asset.prototype.fetchAll = function(callback){
  return api.getAssets(callback);
}

module.exports = Asset;
