var AssetUploader = require('./AssetUploader');

// pick or upload assets

module.exports = class AssetPicker{
  constructor(el,options){
    this.assets = [];
    this.el = el;

    this.uploadContain = document.createElement('div');
    this.assetUploader = new AssetUploader(this.uploadContain,options);
    this.el.appendChild(this.uploadContain);
  }

}
