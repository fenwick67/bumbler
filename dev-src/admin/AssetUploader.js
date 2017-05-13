var uploader = require('fine-uploader').FineUploader;

module.exports = class AssetUploader extends Object{
  constructor(element){
    super();
    this.assets = [];

    this.uploader = new uploader({
      debug: true,
      element: element,
      request: {
        endpoint: '/admin/asset'
      },
      validation: {
        allowedExtensions: ['jpg','jpeg','png','bmp','gif','mp3','mp4','wav','ogg']
      }
    });

    this.element = element;

  }


}
