var PopupManager = require('./PopupManager');
var Asset = require('./Asset');
var AssetView = require('./AssetView');
var AssetsView = require('./AssetsView');
var PugEditor = require('./PugEditor');
var initNavigation = require('./initNavigation')
var PostEditor = require('./PostEditor');
var PostList = require('./PostList');
var CustomPageList = require('./CustomPageList');
var SettingsManager = require('./SettingsManager');
var ScriptsView = require('./ScriptsView');

import Buefy from 'buefy';
import Vue from 'vue'
Vue.use(Buefy);


const api = require('./rpc').api;

// for UI purposes
if (!localStorage['admin']){
  localStorage['admin']="maybe?";
}

/*
  not logged in.

  NOTE that this isn't a security measure!
    It's a user feature that redirects them if the JWT isn't valid.
    If we didn't, all the operations would just fail.
*/
if (!localStorage['jwt']){
  window.location.href='/login';
}
api.echo(er=>{
  if(er){
    window.location.href='/login';
  }
})

document.querySelector('#logout').addEventListener('click',function(){
  // log out
  localStorage['jwt']='';
  window.location.href='/login';
})



document.addEventListener("DOMContentLoaded", function(event) {

  //navigation
  initNavigation();

  // popups
  var popupManager = PopupManager('#popup-area');
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
    settingsManager.load();
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
  });

  var postEditor = null;
  document.getElementById('post-edit').addEventListener('navigate-to',function(){
    if (!postEditor){
      var el = this.querySelector('.editor')
      postEditor = new PostEditor(el,{canDelete:true });
    }
    var id = window.location.hash.replace(/.*id=/,'');
    if(id){
      console.log(id);
      postEditor.load(id);
    }
  });


  // post list
  var postList = null;
  document.getElementById('posts').addEventListener('navigate-to',function(){
    if (!postList){
      postList = new PostList(document.getElementById('posts-list'));
    }
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


  //scripts
  var scriptsView = null;
  document.getElementById('scripts').addEventListener('navigate-to',function(){
    if (!scriptsView){
      scriptsView = new ScriptsView(this.querySelector('div'));
    }
    scriptsView.load();
  })

  document.getElementById('run-a-build').addEventListener('click',startBuild);

  // night mode

  applyNightModeIfSet();
  document.getElementById('toggle-night-mode').addEventListener('click',toggleNightMode);


  // always navigate to a hash on pageload
  navigate();

}); // end DOM loaded



function startBuild(){
  popup('build started','link');
  api.build(er=>{
    if(!er){
      popup('build complete!','success')
    }else{
      popup(e,'danger','Error running build:')
    }
  })
}

// make globally accessible
window.startBuild = startBuild;

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
