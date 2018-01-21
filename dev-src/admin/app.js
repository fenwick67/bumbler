var PopupManager = require('./PopupManager');
var Asset = require('./Asset');
var AssetView = require('./AssetView');
var AssetsView = require('./AssetsView');
var PugEditor = require('./PugEditor');
var AssetUploader = require('./AssetUploader');
var initNavigation = require('./initNavigation')
var PostEditor = require('./PostEditor');
var Post = require('../../lib/Post');
var PostList = require('./PostList');
var CustomPageList = require('./CustomPageList');
var CustomPageEditor = require('./CustomPageEditor');
var SettingsManager = require('./SettingsManager');
var ScriptsView = require('./ScriptsView');
var publish = require('./publisher');

// for UI purposes
if (!localStorage['admin']){
  localStorage['admin']="maybe?";
}

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
      htmlEditor = new PugEditor('/admin/html',document.getElementById('htmleditor'),'pug');
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

  var postEditor = null;
  document.getElementById('post-edit').addEventListener('navigate-to',function(){
    if (!postEditor){
      var el = this.querySelector('.editor')
      postEditor = new PostEditor(el,{canDelete:true });
    }
    var id = window.location.hash.replace(/.*id=/,'');
    postEditor.load(id);
  });


  // post list
  var postList = null;
  document.getElementById('posts').addEventListener('navigate-to',function(){
    if (!postList){
      postList = new PostList(document.getElementById('posts-list'));
    }
    postList.clear();
    postList.load();
  });

  // post list
  var customPageList = null;
  document.getElementById('custompages').addEventListener('navigate-to',function(){
    if (!customPageList){
      customPageList = new CustomPageList(document.getElementById('custom-page-list'));
    }
    customPageList.load();
  });

  // publish
  var publishInitialized = false;
  document.getElementById('publish').addEventListener('navigate-to',function(){
    if (!publishInitialized){
      publishInitialized = true;
      this.querySelector('[name="build"]').addEventListener('click',startBuild);
    }
  });

  //scripts
  var scriptsView = null;
  document.getElementById('scripts').addEventListener('navigate-to',function(){
    if (!scriptsView){
      scriptsView = new ScriptsView(this.querySelector('div'));
    }
    scriptsView.load();
  })

  document.getElementById('run-a-build').addEventListener('click',startBuild);
  document.getElementById('publish-button').addEventListener('click',publish);

  // night mode

  applyNightModeIfSet();
  document.getElementById('toggle-night-mode').addEventListener('click',toggleNightMode);


  // always navigate to a hash on pageload
  navigate();

}); // end DOM loaded



function startBuild(){
  fetch('/admin/build',{method:"POST",credentials: "include"}).then(res=>{
    if (!res.ok){throw new Error('response not ok');return;}
    popup('Build triggered.','info')
  }).catch(e=>{
    popup(e,'danger','Error starting build:')
  });
}

function toggleNightMode(){
  var isNight = false;
  if ( (" " + document.documentElement.className + " ").replace(/[\n\t]/g," ").indexOf(" nightmode ") > -1 ) {
    isNight = true;
  }
  document.documentElement.classList.toggle('nightmode')
  window.localStorage['nightmode'] = (!isNight).toString();
}

function applyNightModeIfSet(){
  if (window.localStorage['nightmode'] == 'true'){
    document.documentElement.classList.add('nightmode');
  }
}
