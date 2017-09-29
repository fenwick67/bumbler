var Post = require('../../lib/Post')
var AssetPicker = require('./AssetPicker.js')
var Asset = require('./Asset');
var moment = require('moment');
var loadSettings = require('./loadSettings');

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
      category
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
    this.categoryField = field();
    // categoryField will be updated in reset()

    this.captionField = field();
    this.captionField.innerHTML = `
      <label class="label">Caption/Content
      <p class="control">
        <textarea class="textarea" placeholder="Use Markdown for bonus points" name="caption"></textarea>
      </p>
      </label>`

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
    this.picker = new AssetPicker(this.pickerEl);

    this.form.appendChild(this.titleField);
    this.form.appendChild(this.categoryField);
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
    var category = self.el.querySelector('[name="category"]').value;
    var caption = self.el.querySelector('[name="caption"]').value;
    var title = self.el.querySelector('[name="title"]').value;
    var assets = self.picker.assetUploader.assets;
    var date = this.date || moment().format();
    var id = this.id || Post.prototype.uuid();
    var json = {category,caption,title,assets,date,id};

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

      // 4 post it up
      var ok = false;
      fetch('/admin/post',
        {
          method:'POST',
          body:JSON.stringify(json),
          headers:{'Content-Type': 'application/json'},
          credentials: "include"
        }).then(res=>{
          ok = res.ok;
          if (ok){
            popup('uploaded post!');
            self.reset();
          }else{
            popup('failed to upload','danger','Error');
          }
      });

    });

  }

  // load from browser by id
  load(id){
    this.reset();
    if (!id){
      return;
    }
    var ok=false;
    fetch('/admin/post?id='+id,
      {
        headers:{'Content-Type': 'application/json'},
        credentials: "include"
      }).then(res=>{
        ok = res.ok;
        if (ok){
          return res.json();
        }else{
          popup('Failed to load post','danger','Error');
        }
    }).then(data=>{
      if (ok){
        this.populate(data);
      }
    }).catch(e=>{
      console.error(e);
      popup('Failed to load post','danger','Error')
    });

  }

  populate(data){
    this.picker.assetUploader.reset();
    //

    this.caption = data.caption||"";
    this.id = data.id||false;
    this.title = data.title||"";
    this.category = data.category||"";

    console.log('TODO: load assets');
    var assets = data.assets || [];

    assets.forEach(a=>{
      this.picker.assetUploader.addAssetFromHref(a.href);
    });

    this.el.querySelector('[name="caption"]').value = this.caption||'';
    this.el.querySelector('[name="title"]').value = this.title||'';
    this.el.querySelector('[name="category"]').value = this.category||'';
  }

  reset(){
    this.id = false;
    this.title="";
    this.category="";
    this.caption="";

    this.picker.assetUploader.reset();
    this.el.querySelector('[name="caption"]').value ='';
    this.el.querySelector('[name="title"]').value = '';
    this.updateCategories();

  }

  delete(callback){
    var callback = callback || function(e){if(e){throw e}}
    var id = this.id;
    if (!id){
      return callback(new Error('I HAVE NO ID SO I DUNNO HOW TO DELETE THIS'))
    }

    var ok = false;
    fetch('/admin/post?id='+id,
      {
        method:'DELETE',
        credentials: "include"
      }).then(res=>{
        ok = res.ok;
        if (ok){
          popup('deleted post','success');
          navigate('posts')
        }else{
          popup('failed to delete','danger');
        }
    }).catch(e=>{
      popup(e,'danger','Error Deleting:');
    });

  }

  updateCategories(){
    loadSettings((er,settings)=>{
      if (er){
        return window.popup('Failed to load settings!  You should reload and try again :(','danger')
      }
      var categories = [];

      if (typeof settings.categories == 'string'){
        categories = settings.categories.split(',');
      }else if (Array.isArray(settings.categories)){
        categories = settings.categories;
      }

      var catHtml = '';
      categories.forEach(c=>catHtml+=`<option value="${c}">${c}</option>`);

      this.categoryField.innerHTML = `
        <label class="label">Category
        <p class="control">
          <span class="select">
            <select name="category">
              ${catHtml}
            </select>
          </span>
        </p>
        </label>`;
    });
  }


}
