var Post = require('../../../lib/Post')
var AssetPicker = require('./AssetPicker.js')
var Asset = require('./Asset');
var moment = require('moment');

module.exports = class PostEditor extends Object{
  constructor(el){
    super();
    this.el = el;
    // add appropriate fields to this
    /*
      id
      date
      type (text, link, embed, audio, video, image)
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
    var types = ['text', 'link', 'embed', 'audio', 'video', 'image'];
    this.typeField = field();
    this.typeField.innerHTML = `
      <label class="label">Post Type
      <p class="control">
        <span class="select">
          <select name="type">
            <option value="image" >image</option>
            <option value="audio" >audio</option>
            <option value="video" >video</option>
            <option value="text" >text</option>
          </select>
        </span>
      </p>
      </label>`;

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
    this.form.appendChild(this.typeField);
    this.form.appendChild(this.pickerEl);
    this.form.appendChild(this.captionField);
    this.form.appendChild(this.submitButton);

    this.el.appendChild(this.form);

    var self = this;
    function _save(e){
      e.preventDefault();
      self.save();
      return false;
    }
    this.submitButton.addEventListener('click',_save);
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
    var type = self.el.querySelector('[name="type"]').value;
    var caption = self.el.querySelector('[name="caption"]').value;
    var title = self.el.querySelector('[name="title"]').value;
    var assets = self.picker.assetUploader.assets;
    var date = moment().format();
    var id = Post.prototype.uuid();
    var json = {type,caption,title,assets,date,id};

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
    console.log('todo: load')
  }

  reset(){
    this.picker.assetUploader.reset();
    this.el.querySelector('[name="caption"]').value ='';
    this.el.querySelector('[name="title"]').value = '';
  }


}
