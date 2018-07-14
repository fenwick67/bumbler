var Asset = require('./Asset');
const api = require('./rpc').api;

import Vue from 'vue/dist/vue.js';
import each from 'async/each';
import { ulid } from 'ulid';
import Buefy from 'buefy';
Vue.use(Buefy);

module.exports = function(el,options){
  var el = el;
  var options = options || {};
  var id = options.id || null;
  var canDelete = options.canDelete || !!options.id || false;
  var post = {
    tags:[],
    assets:[],
    caption:''
  };
  var files = [];

  var tpl = `
  <div class="editor">
    <div>
      <div class="field">
        <label class="label">Title
          <p class="control">
            <input v-model="post.title" class="input" placeholder="(optional)" name="title" type="text">
          </p>
        </label>
      </div>
      <div class="field">
        <label class="label">Tags
        <p class="control">
          <b-taginput
                v-model="post.tags"
                ellipsis
                placeholder="Add a tag">
            </b-taginput>
        </p>
        </label>
      </div>
      <div class="field">
        <div>
          <label class="label">Assets</label>
          <div>
            <b-field>
                <b-upload v-model="dropFiles" multiple drag-drop @input="gotFiles">
                  <div class="content has-text-centered">
                    <div class="padded">
                      <p>
                        <span class="is-size-3">🡅&#xFE0E;</span><span class="is-size-4">Upload</span>
                      </p>
                    </div>
                  </div>
                </b-upload>
            </b-field>
          </div>
          <div class="uploads-area">

            <div v-for="asset in post.assets" class="upload">
              <div class="box margined">
                <div class="asset-edit">
                  <div class="asset-preview">
                    <img v-if="asset.type=='image'" :src="asset._preview||asset.href" class="thumb"></img>
                    <audio v-else-if="asset.type=='audio'" controls :src="asset._preview||asset.href" class="thumb"></audio>
                    <video v-else-if="asset.type=='video'" controls :src="asset._preview||asset.href" class="thumb"></video>
                    <span v-else>type {{ asset.type }}</span>
                  </div>
                  <div class="asset-rows">
                    <div class="asset-row">
                        <span class="has-text-dark"> {{ asset.href }} </span>
                    </div>
                    <span class="asset-row">

                      <span class="field is-grouped">

                        <p class="control" v-if="asset._uploaded === false">
                          <a class="button is-success" @click="uploadAsset(asset)" v-bind:class="{ 'is-loading' : asset._uploading }">🡅 Upload</a>
                        </p>
                        <p class="control">
                          <b-tooltip label="remove">
                            <a class="button is-danger" @click="removeAsset(asset,$event)">❌&#xFE0E;</a>
                          </b-tooltip>
                        </p>
                        <p class="control">
                          <b-tooltip :label="asset.featured?'featured':'not featured'">
                            <a class="button" @click="featureAsset(asset,$event)" :class="{'is-warning':asset.featured,'is-default':!asset.featured}">
                              ★&#xFE0E;
                            </a>
                          </b-tooltip>
                        </p>
                        <p class="control">
                          <b-tooltip label="add inline">
                            <a class="button is-primary" @click="addToContent(asset,$event)">🡇&#xFE0E;</a>
                          </b-tooltip>
                        </p>
                      </span>
                    </span>
                  </div>
                </div><!-- end asset-edit -->
              </div><!-- end box -->
            </div><!-- end column -->
          </div><!-- end columns -->

        </div>
      </div>
      <div class="field">
        <label class="label">Caption/Content</label>
        <textarea
          v-model="post.caption"
          class="textarea"
          ref="textarea"
          name="caption"
          @change="updateCursorPosition"
          @click="updateCursorPosition"
          @keyup="updateCursorPosition">
        </textarea>
      </div>
      <div class="field is-grouped">
        <p class="control">
          <button @click="save" class="button is-link">💾︎ Submit Post</button>
          <button @click="deletePost" v-if="canDelete" class="button is-danger">❌&#xFE0E; Delete</button>
          <button @click="discard" v-if="!canDelete" class="button is-warning">⮌︎ Discard</button>
        </p>
      </div>
    </div>
    <b-loading :is-full-page="true" :active="loading" :can-cancel="false"></b-loading>
  </div>`

  var view = new Vue({
    el:el,
    template:tpl,
    data:{options,post,canDelete,dropFiles:[],cursorPosition:0,loading:false},
    computed:{},
    methods:{

      save:function(){
        console.log('saving');
        this.loading = true;
        var assets = JSON.parse(JSON.stringify(this.post.assets));
        assets = assets.map(a=>{
          Object.keys(a).forEach(k=>{
            if (k.charAt(0) === '_'){
              delete a[k];
            }
          })
          return a;
        });

        var json = {
          tags:this.post.tags||'',
          caption:this.post.caption||'',
          title:this.post.title||'',
          assets:assets||[],
          date:this.post.date || new Date().toISOString(),
          id:this.post.id || ulid()
        };


        // upload
        this.uploadAll(er=>{
          if (er){
            this.loading = false;
            return popup(er,'danger','Error uploading files')
          }

          api.putPost(json,(er)=>{
            this.loading = false;
            if (!er){
              popup('uploaded post!','success');
              this.post = {};
              window.startBuild();
              window.location.hash='#post/create'
            }else{
              popup(er,'danger','Error');
            }
          });

        });

      },
      // load from browser by id
      load(id){
        this.loading = true;
        this.post = {};
        api.getPost(id,(er,post)=>{
          this.loading = false;
          if (!er){

            // now normalize it
            if (typeof post.tags == 'string'){
              post.tags = post.tags.split(',');
            }
            post.assets.forEach(a=>{
              a.featured = !!a.featured;
            })

            this.post = post;
          }
          else{
            window.popup(er,'warning','error loading post')
          }
        });
      },
      discard:function(){
        this.post = {
          tags:[],
          assets:[],
          caption:''
        };
        this.dropFiles= [];
      },
      deletePost(callback){
        var callback = typeof callback === 'function'?callback:function(){};
        var id = this.post.id;
        if (!id){
          return callback(new Error('I HAVE NO ID SO IUNNO HOW TO DELETE THIS'))
        }

        api.deletePost(id,function(er){
          if(!er){
            popup('deleted post','success');
            window.location.hash='#posts'
            window.startBuild();
          }else{
            popup('failed to delete','danger');
          }
          callback(er);
        });

      },
      uploadAsset(asset,callback){
        var file = asset._file;
        var cb = callback || function(){};
        var url = '/admin/asset';
        var xhr = new XMLHttpRequest();
        var fd = new FormData();
        xhr.open("POST", url, true);
        xhr.setRequestHeader('Authorization','Bearer '+localStorage.getItem('jwt'))
        var done = false;

        asset._uploading = true;
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
            // Every thing ok, file uploaded
            asset._uploaded = true;
            asset._uploading = false;
            cb(null);
          }else if (xhr.status != 200 && xhr.readyState == 4){
            cb(xhr.responseText);
          }
        };
        fd.append("upload_file", file);
        xhr.send(fd);

      },
      uploadAll(done){
        var done = done || function(){};
        each(this.post.assets,(a,cb)=>{
          if(a._uploaded === false){
            this.uploadAsset(a,cb)
          }else{
            cb(null);
          }
        },done);
      },
      removeAsset(a){
        var idx = this.post.assets.indexOf(a)
        if (idx > -1){
          this.post.assets.splice(idx,1);
        }
      },
      featureAsset(a){
        var idx = this.post.assets.indexOf(a)
        if (idx > -1){
          this.post.assets[idx].featured = !this.post.assets[idx].featured;
        }else{
          console.warn('asset not found? ',a)
        }
      },
      updateCursorPosition(){
        var ta = this.$refs.textarea;
        this.cursorPosition = ta.selectionStart;
      },
      addToContent(asset){
        var ta = this.$refs.textarea;
        var widget;
        if(asset.type == 'audio'){
          widget = `<audio controls title="" src="${asset.href}"/>`;
        }else if( asset.type == "video"){
          widget = `<video controls title="" src="${asset.href}"/>`;
        }else if (asset.type == 'image'){
          widget = `![description here](${asset.href})`;
        }else{
          widget = `[description here](${asset.href})`;
        }
        if (!this.post.caption || !ta){ // handle case where caption doesn't exist RN
          console.log('1')
          this.post.caption = widget;
        }else{
          var cursorPosition = ta.selectionStart;
          this.post.caption = this.post.caption.slice(0,cursorPosition)+widget+this.post.caption.slice(cursorPosition);
        }

      },
      // do note: this only creates an asset, it doesn't add it to the post.assets!
      createAssetFromFile(file){
        var a = new Asset('/assets/'+file.name);
        a._file = file;
        a._preview = null;
        a._uploaded = false;
        a._uploading = false;

        // actually read the file and render it
        var reader = new FileReader();

        reader.onload = function() {
          a._preview = reader.result;
        };
        reader.readAsDataURL(file);

        return a;
      },
      fileInputChanged:function(e){
        var input = e.target;
        for (var i = 0; i < input.files.length; i ++){
          this.post.assets.push(this.createAssetFromFile(input.files[i]))
        }
      },
      gotFiles:function(e){
        for (var i = 0; i < this.dropFiles.length; i ++){
          this.post.assets.push(this.createAssetFromFile(this.dropFiles[i]))
        }

        // empty dropfiles
        while(this.dropFiles.length > 0){
          this.dropFiles.pop();
        }
      }

    }

  });

  if (id){
    view.load(id);
  }

  return view;

}

function isImg(filename){
  function getExt(n){
    var i = n.lastIndexOf('.');
    if (i > -1){
      return n.slice(i+1);
    }else{return ''}
  }
  var ext = getExt(filename).toLowerCase();
  var n = ['png','gif','bmp','svg','tif','jpg','jpeg'];
  return (n.indexOf(ext) > -1)
}
