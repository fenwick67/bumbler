var AssetUploader = require('./AssetUploader');
var AssetView = require('./AssetView');

// pick or upload assets

module.exports = class AssetPicker{
  constructor(el){
    this.assets = [];
    this.el = el;

    this.uploadContain = document.createElement('div');
    this.assetUploader = new AssetUploader(this.uploadContain);
    this.el.appendChild(this.uploadContain);
  }

}
