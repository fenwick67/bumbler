var PopupManager = require('./PopupManager');
var Asset = require('./Asset');
var AssetView = require('./AssetView');
var AssetsView = require('./AssetsView');
var FileEditor = require('./FileEditor');
var AssetUploader = require('./AssetUploader');
var initNavigation = require('./initNavigation')
var PostEditor = require('./PostEditor');
var Post = require('../../lib/Post');
document.addEventListener("DOMContentLoaded", function(event) {

  //navigation
  initNavigation();

  // popups
  var popupManager = new PopupManager('#popup-area');
  window.popup = popupManager.show.bind(popupManager);

  // files controller
  var filesAssetsView = null;
  document.getElementById('files').addEventListener('navigate-to',function(){
    if (!filesAssetsView){
      var box = this.querySelector('.file-view');
      filesAssetsView = new AssetsView(box);
    }
    filesAssetsView.load();
  });

  // html editor
  var htmlEditor = null;
  document.getElementById('html').addEventListener('navigate-to',function(){
    if (!htmlEditor){
      htmlEditor = new FileEditor('/admin/html',document.getElementById('htmleditor'),'pug');
    }
    htmlEditor.load();
  });

  var postCreator = null;
  document.getElementById('post-create').addEventListener('navigate-to',function(){
    if (!postCreator){
      var el = this.querySelector('.editor')
      postCreator = new PostEditor(el);
    }
    postCreator.load();
  });

  // always navigate to a hash on pageload
  var page = window.location.hash.replace('#','').replace(/\//g,'-');
  navigate(page||'posts-edit');

}); // end DOM loaded
