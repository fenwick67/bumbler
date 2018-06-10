var Asset = require('./Asset');
const api = require('./rpc').api;

import Vue from 'vue/dist/vue.js';
import each from 'async/each';
import { ulid } from 'ulid';

module.exports = function(el,options){
  var el = el;
  var options = options || {};
  var id = options.id || null;
  var canDelete = options.canDelete || !!options.id || false;
  var post = {
    tags:'',
    assets:[]
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
          <input v-model="post.tags" class="input" placeholder="(comma seperated, optional)" name="tags" type="text">
        </p>
        </label>
      </div>
      <div class="tags">
        <span class="tag is-link" v-for=" tag in tagsList ">
          {{ tag }}
        </span>
      </div>
      <div class="field">
        <div>
          <label class="label">Assets</label>
          <div class="file has-name is-boxed">
            <label class="file-label">
              <input multiple="multiple" class="file-input" type="file" style="display:none" @change="fileInputChanged">
              <span class="file-cta">
                <span class="file-icon">📁︎🢁</span>
                <span class="file-label">
                  Upload assets…
                </span>
              </span>
            </label>
          </div>
          <div class="gallery">
            <div v-for="asset in post.assets" class="level">
              <img v-if="asset.type=='image'" :src="asset._preview||asset.href" class="thumb"></img>
              <span v-else>{{ asset.type }}</span>
              <i> {{ asset.href }} </i>
              <a v-if="asset._uploaded === false" class="button is-success" @click="uploadAsset(asset)">🢁 Upload now</a>
              <a class="button is-danger" @click="removeAsset(asset,$event)">❌&#xFE0E; Remove</a>
            </div>
          </div>
        </div>
      </div>
      <div class="field">
        <label class="label">Caption/Content</label>
        <textarea v-model="post.caption" class="textarea" name="caption"></textarea>
      </div>
      <div class="field is-grouped">
        <p class="control">
          <button @click="save" class="button is-link">💾︎ Submit Post</button>
          <button @click="deletePost" v-if="canDelete" class="button is-danger">❌&#xFE0E; Delete</button>
        </p>
      </div>
    </div>
  </div>`

  var view = new Vue({
    el:el,
    template:tpl,
    data:{options,post,canDelete,files},
    computed:{
      tagsList:function(){
        var tags = this.post&&typeof this.post.tags == 'string'?this.post.tags:'';
        var t = tags.split(/,\s*/g);
        t = t.filter(s=>!!s);
        return t;
      }
    },
    methods:{

      save:function(){
        console.log('saving');

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
            return popup(er,'danger','Error uploading files')
          }

          api.putPost(json,(er)=>{
            if (!er){
              popup('uploaded post!','success');
              this.post = {};
              window.startBuild();
            }else{
              popup(er,'danger','Error');
            }
          });

        });

      },

      // load from browser by id
      load(id){
        api.getPost(id,(er,post)=>{
          if (!er){
            this.post = post;
          }
          else{
            window.popup(er,'warning','error loading post')
          }
        });
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
            navigate('posts')
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
        xhr.onreadystatechange = function() {
          if (xhr.readyState == 4 && xhr.status == 200) {
            // Every thing ok, file uploaded
            asset._uploaded = true;

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

      // do note: this only creates an asset, it doesn't add it to the post.assets!
      createAssetFromFile(file){
        var a = new Asset('/assets/'+file.name);
        a._uploaded = false;
        a._file = file;
        a._preview = null;

        // actually read the file and render it
        var reader = new FileReader();
        if (isImg(file.name)){
          reader.onload = function() {
            a._preview = reader.result;
          };
          reader.readAsDataURL(file);
        }

        return a;
      },

      fileInputChanged:function(e){
        var input = e.target;
        for (var i = 0; i < input.files.length; i ++){
          this.post.assets.push(this.createAssetFromFile(input.files[i]))
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
