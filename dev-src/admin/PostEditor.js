var Post = require('../../lib/Post')
var AssetPicker = require('./AssetPicker.js')
var Asset = require('./Asset');
var moment = require('moment');
var SimpleMDE = require('simplemde');
const api = require('./rpc').api;

module.exports = class PostEditor{
  constructor(el,options){
    var self = this;
    this.el = el;
    this.options = options || {};
    this.id = this.options.id || null;
    this.canDelete = this.options.canDelete || false;
    // add appropriate fields to this
    /*
      id
      date
      tags (comma sep)
      caption
      permalink (from id)
      assets (if audio or video or image)
      title (if a link or embed or text)
    */

    // get a field
    function field(classes){
      var l = document.createElement('div');
      l.setAttribute( 'class','field'+(classes?(' '+classes):'') );
      return l;
    }

    this.form = document.createElement('form');
    this.tagField = field();
    this.tagField.innerHTML = `
      <label class="label">Tags
      <p class="control">
        <input class="input" type="text" placeholder="(comma seperated, optional)" name="tags">
      </p>
      </label>`
    // tagField will be updated in reset()

    this.captionField = field();
    this.captionField.innerHTML = `
      <label class="label">Caption/Content</label>
      <textarea class="textarea" name="caption"></textarea>
      `
    this.mde = new SimpleMDE({
      element:this.captionField.querySelector('textarea'),
    	toolbar: [
        'preview', 'side-by-side', 'fullscreen', '|',
        'code', 'quote','link',
        {
          name: 'image',
          action: function customFunction(editor) {
            // overridden later
          },
          className: 'fa fa-picture-o',
          title: 'Insert Image',
        }
      ]
    });

    this.titleField = field();
    this.titleField.innerHTML = `
    <label class="label">Title
     <p class="control">
       <input class="input" type="text" placeholder="(optional)" name="title">
     </p>
     </label>
    `;

    this.submitGroup = field('is-grouped');
    this.submitButton = document.createElement('button');
    this.submitButton.innerHTML = "💾&#xFE0E; Submit Post";
    this.submitButton.setAttribute('class',"button is-primary");
    var submitP = document.createElement('p');
    submitP.setAttribute('class','control');
    submitP.appendChild(this.submitButton);
    this.submitGroup.appendChild(submitP);

    this.pickerEl = document.createElement('div');
    this.pickerEl.classList.add('field');
    this.picker = new AssetPicker(this.pickerEl,{editor:this.mde});

    this.form.appendChild(this.titleField);
    this.form.appendChild(this.tagField);
    this.form.appendChild(this.pickerEl);
    this.form.appendChild(this.captionField);
    this.form.appendChild(this.submitGroup);

    if (this.canDelete){
      this.deleteButton = document.createElement('button');
      this.deleteButton.innerHTML = "X Delete Post";
      this.deleteButton.setAttribute('class',"button is-danger");
      submitP.appendChild(this.deleteButton);
      this.deleteButton.addEventListener('click',e=>{
        e.preventDefault();

        // delet this
        self.delete();
      })
    }

    this.el.appendChild(this.form);

    function _save(e){
      e.preventDefault();
      self.save();
      return false;
    }
    this.submitButton.addEventListener('click',_save);

    if (this.id){
      this.load(this.id);
    }
  }


  // save from dom => server
  save(){
    console.log('saving');
    var self = this;
    // 1 create json
    // 2 validate
    // 3 upload files
    // 4 POST the post

    //todo validate the form

    //create json
    var tags = self.el.querySelector('[name="tags"]').value;
    var caption = self.mde.value();
    var title = self.el.querySelector('[name="title"]').value;
    var assets = self.picker.assetUploader.assets;
    var date = this.date || moment().format();
    var id = this.id || Post.prototype.uuid();
    var json = {tags,caption,title,assets,date,id};

    // validate
    var problems = Post.prototype.validate(json);
    if (problems){
      popup(problems,'danger','Post error:')
      return;
    }

    // upload
    this.picker.assetUploader.uploadAll(function(er){
      if (er){
        return popup(er,'danger','Error uploading files')
      }

      api.putPost(json,function(er){
        if (!er){
          popup('uploaded post!','success');
          self.reset();
        }else{
          popup(er,'danger','Error');
        }
      });

    });

  }

  // load from browser by id
  load(id){
    this.reset(er=>{
      if (!id){
        return;
      }
      api.getPost(id,(er,post)=>{

        if (!er){
          this.populate(post);
        }
        else{
          window.popup(er,'warning','error loading post')
        }

      });

    });

  }

  populate(data){
    this.picker.assetUploader.reset();
    //

    this.caption = data.caption||"";
    this.id = data.id||false;
    this.title = data.title||"";
    this.tags = data.tags||"";
    if (data.date){
      this.date = data.date;
    }

    console.log('TODO: load assets');
    var assets = data.assets || [];

    assets.forEach(a=>{
      this.picker.assetUploader.addAssetFromHref(a.href);
    });

    this.mde.value(this.caption||'');
    this.el.querySelector('[name="title"]').value = this.title||'';
    this.el.querySelector('[name="tags"]').value = this.tags||'';
  }

  reset(done){
    var done = done || function(e){if (e) throw e};
    this.id = false;
    this.title="";
    this.tags="";
    this.caption="";

    this.picker.assetUploader.reset();
    this.mde.value('');
    this.el.querySelector('[name="title"]').value = '';
    this.el.querySelector('[name="tags"]').value = '';
    done(null);

  }

  delete(callback){
    var callback = callback || function(e){if(e){throw e}}
    var id = this.id;
    if (!id){
      return callback(new Error('I HAVE NO ID SO I DUNNO HOW TO DELETE THIS'))
    }

    api.deletePost(id,function(er){
      if(!er){
        popup('deleted post','success');
        navigate('posts')
      }else{
        popup('failed to delete','danger');
      }
    });

  }



}
