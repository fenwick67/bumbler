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
        'image':['jpg','jpeg','png','bmp','gif']
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
}

Asset.prototype.fetchAll = function(callback){

  var ok = false;
  fetch('/admin/glob?pattern='+encodeURIComponent('./assets/*')).then(response=>{
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
