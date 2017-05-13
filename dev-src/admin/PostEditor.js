var Post = require('../../lib/Post')
var AssetPicker = require('./AssetPicker.js')

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
    this.form.method="GET";
    this.form.action="#post/create";
    var types = ['text', 'link', 'embed', 'audio', 'video', 'image'];
    this.typeField = field();
    this.typeField.innerHTML = `
      <label class="label">Post Type</label>
      <p class="control">
        <span class="select" name="type">
          <select>
            <option value="image" >image</option>
            <option value="audio" >audio</option>
            <option value="video" >video</option>
            <option value="text" >text</option>
          </select>
        </span>
      </p>`;

    this.captionField = field();
    this.captionField.innerHTML = `
      <label class="label">Caption/Content</label>
      <p class="control">
        <textarea class="textarea" placeholder="Use Markdown for bonus points" name="caption"></textarea>
      </p>`

    this.titleField = field();
    this.titleField.innerHTML = `
    <label class="label">Title</label>
     <p class="control">
       <input class="input" type="text" placeholder="(optional)" name="title">
     </p>
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
    this.picker = new AssetPicker(this.pickerEl);
    console.log(this.picker);

    this.form.appendChild(this.titleField);
    this.form.appendChild(this.typeField);
    this.form.appendChild(this.captionField);
    this.form.appendChild(this.submitButton);

    this.el.appendChild(this.form);
    this.el.appendChild(this.pickerEl);

    var self = this;
    function _save(){
      self.save();
    }
    this.submitButton.addEventListener('click',_save);
  }

  // get json from the elements
  serialize(){
    var json = {};
    // get names


  }

  // save from dom => server
  save(){

  }

  // load from browser by id
  load(id){

  }


}
