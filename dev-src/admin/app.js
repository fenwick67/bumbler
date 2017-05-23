var PopupManager = require('./PopupManager');
var Asset = require('./Asset');
var AssetView = require('./AssetView');
var AssetsView = require('./AssetsView');
var FileEditor = require('./FileEditor');
var AssetUploader = require('./AssetUploader');
var initNavigation = require('./initNavigation')
var PostEditor = require('./PostEditor');
var Post = require('../../lib/Post');
var PostList = require('./PostList');
var SettingsManager = require('./SettingsManager');
var publish = require('./publisher');

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

  var settingsManager = null;
  document.getElementById('settings').addEventListener('navigate-to',function(){
    if (!settingsManager){
      settingsManager = new SettingsManager(this.querySelector('form'));
    }
  })

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

  // html editor
  var postList = null;
  document.getElementById('posts').addEventListener('navigate-to',function(){
    if (!postList){
      postList = new PostList(document.getElementById('posts-list'));
    }
    postList.clear();
    postList.load();
  });

  var publishInitialized = false;
  document.getElementById('publish').addEventListener('navigate-to',function(){
    if (!publishInitialized){
      publishInitialized = true;
      this.querySelector('[name="build"]').addEventListener('click',startBuild);
    }
  })

  document.getElementById('run-a-build').addEventListener('click',startBuild);
  document.getElementById('publish-button').addEventListener('click',publish);

  // always navigate to a hash on pageload
  var page = window.location.hash.replace('#','').replace(/\//g,'-');
  navigate(page||'post-create');

}); // end DOM loaded



function startBuild(){
  fetch('/admin/build',{method:"POST",credentials: "include"}).then(res=>{
    if (!res.ok){throw new Error('response not ok');return;}
    popup('Build triggered.','info')
  }).catch(e=>{
    popup(e,'danger','Error starting build:')
  });
}
