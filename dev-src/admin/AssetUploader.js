var Asset = require('./Asset');
var _ = require('lodash');

module.exports = class AssetUploader {
  constructor(element,options){
    var self = this;
    this.assets = [];
    this.files = [];
    this.thumbnails = [];
    this.options = options || {};


    var parentLabel = document.createElement('label');
    parentLabel.setAttribute('class','label');
    parentLabel.innerHTML = "Assets";
    element.appendChild(parentLabel);

    var div = document.createElement('div');

    ['file','has-name','is-boxed'].forEach(c=>{
      div.classList.add(c);
    });

    var label = document.createElement('label');
    label.classList.add('file-label');

    var input = document.createElement('input');
    input.setAttribute('type','file')
    input.setAttribute('multiple','multiple');
    input.classList.add('file-input');
    div.appendChild(label);
    label.appendChild(input);

    var s = document.createElement('span');
    s.classList.add('file-cta');
    s.innerHTML = `<span class="file-icon">
        📁︎🢁
      </span>
      <span class="file-label">
        Upload assets…
      </span>`
    label.appendChild(s);

    element.appendChild(div);

    self.input = input;

    var gallery = document.createElement('div');
    this.gallery = gallery;
    gallery.setAttribute('class','gallery');
    element.appendChild(gallery);

    input.addEventListener('change', function(e){
      fileInputChanged(this,null);
    }, false);

    function fileInputChanged(input,next){
      var assets = [];
      for (var i = 0; i < input.files.length; i ++){
        assets.push(self.addAssetFromFile(input.files[i]))
      }
      if (next){
        next(assets)
      }
    }


    var cancelDrag = function(){
      div.style = "";
      return false
    }
    div.ondragexit = div.ondragend = div.ondragleave = cancelDrag;

    div.ondrop = function(event){
      event.preventDefault();
      cancelDrag();
      var files = event.dataTransfer.files;
      for (var i = 0; i < files.length; i ++){
        self.addAssetFromFile(files[i]);
      }
      return false;
    }

    div.ondragover = function(event){
      div.style = "border-style: dashed"
      return false;
    }


    if (options.editor){
      window.editor=options.editor;
      var toolbarButton = options.editor.toolbarElements.image;

      // replace with another element
      var replacement = document.createElement('span');
      // replacement.setAttribute('class','field');
      replacement.innerHTML = `
          <label>
            <input style="display:none" type="file" multiple="multiple">
            <a class="fa fa-image" title="Upload Image and Insert"></a>
          </label>`

      replacement.querySelector('input[type="file"]').addEventListener('change',function(e){
        fileInputChanged(this,function(assets){
          assets.forEach(function(asset){
            self.addImageToEditor(asset.href);
          });
        });
      },false);

      var parent = toolbarButton.parentElement;
      parent.replaceChild(replacement,toolbarButton);

    }


  }

  addAssetFromFile(file){
    var self = this;
    var a = new Asset('/assets/'+file.name);
    self.assets.push(a);
    var thumb = self.previewImage(file,a);
    self.thumbnails.push(thumb);
    self.files.push(file);
    return a;
  }

  addAssetFromHref(href){
    var self = this;
    var a = new Asset(href);
    a.uploaded = true;
    self.assets.push(a);
    var thumb = self.previewImage(null,a);
    self.thumbnails.push(thumb);
    return a;
  }

  previewImage(file,asset) {
    var self = this;

    var file = file || false;

    var href = file?'/assets/' + file.name:asset.href;
    var thumb = document.createElement("div");
    thumb.classList.add("asset");
    var img = document.createElement("img");
    var title = document.createElement('b');
    title.innerHTML = href;
    img.classList.add('thumb'); // Add the class thumbnail to the created div

    if (!file){
      // read from href
      img.src=href;
      console.log(img);
    }

    if (file){ img.file = file; }
    thumb.appendChild(img);
    thumb.appendChild(title);

    var delBtn = document.createElement('button');
    delBtn.classList.add('button')
    delBtn.classList.add('is-danger')
    delBtn.innerHTML = 'Remove';
    delBtn.title="Remove this file from the post's assets";
    // delete it on click
    delBtn.addEventListener('click',function(e){
      self.files = _.filter(self.files,f=>{
        return f != file;
      });
      self.assets = _.filter(self.assets,ass=>{
        return ass.href != href;
      })
      thumb.parentElement.removeChild(thumb);
      e.preventDefault();
    });


    thumb.appendChild(delBtn);


    // upload button
    if (this.options.editor && !asset.uploaded){
      var ed = this.options.editor;
      var uploadButton = document.createElement('button');
      uploadButton.classList.add('button')
      uploadButton.classList.add('is-success')
      uploadButton.innerHTML = 'Upload Now';
      uploadButton.title="Upload this asset now.\n\nAll assets are always uploaded when you submit the post."

      thumb.appendChild(uploadButton);

      uploadButton.addEventListener('click',function(e){
        e.preventDefault();
        self.upload(file,function done(er){
          thumb.removeChild(uploadButton)
        });
        return false;
      })
    }

    // add to content button
    if (this.options.editor){
      var ed = this.options.editor;

      var info = `If your template does not include a list of assets, use this to drop them into the post content.

If your template DOES include assets, don't worry about this.`;

      var addButton = document.createElement('button');
      addButton.classList.add('button')
      addButton.innerHTML = 'Add to content';


      var q = document.createElement('a');
      q.setAttribute('class','button is-info');
      q.innerHTML = '<span class="icon"><i class="fa fa-question"></i></span>'

      var combo = document.createElement('span');
      combo.setAttribute('class','buttons has-addons')
      combo.title= info;

      combo.appendChild(addButton);
      combo.appendChild(q);
      thumb.appendChild(combo);

      q.addEventListener('click',function(e){
        e.preventDefault();
        window.popup(info.replace(/\n/g,'<br>'),'info')
        return false;
      });

      addButton.addEventListener('click',function(e){
        e.preventDefault();
        self.addImageToEditor(asset.href);
        return false;
      });

    }

    this.gallery.appendChild(thumb);

    // Using FileReader to display the image content
    if (file){
      var reader = new FileReader();
      if (isImg(file.name)){
        reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
      }
      reader.readAsDataURL(file);
    }
    return thumb;
  }

  addImageToEditor(href){
    var ed = this.options.editor;
    if (!ed){return;}
    // add an image tag to it
    var pos = ed.codemirror.getCursor();

    var s = '![alt text]('+href+')';

    ed.codemirror.replaceRange(s, {
      line: pos.line,
      ch: pos.ch
    });

  }

  upload(file,callback){
    var self = this;
    var cb = callback || function(){};
    var url = '/admin/asset';
    var xhr = new XMLHttpRequest();
    var fd = new FormData();
    xhr.open("POST", url, true);
    var done = false;
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status == 200) {
        // Every thing ok, file uploaded
        console.log(xhr.responseText); // handle response.
        cb(null);
      }else if (xhr.status != 200 && xhr.readyState == 4){
        console.error('bad')
        cb(xhr.responseText);
      }
    };
    fd.append("upload_file", file);
    xhr.send(fd);
  }

  uploadAll(done){
    var self = this;
    var i = 0;
    var n = this.files.length;
    if (i == n || !n || !this.files){return done(null);}

    var finished = false
    function cb(er){
      if (finished){return;}
      if (er){
        finished = true;
        return done(er);
      }
      i++;
      if (i == n){
        done(null);
      }
    }
    this.files.forEach(f=>{
      self.upload(f,function(er){
        cb(er);
      });
    });
  }

  reset(){
    this.files = [];
    this.assets = [];
    this.gallery.innerHTML = '';
    this.input.value = "";
  }

}

function getExt(n){
  var i = n.lastIndexOf('.');
  if (i > -1){
    return n.slice(i+1);
  }else{return ''}
}

function isImg(filename){
  var ext = getExt(filename).toLowerCase();
  var n = ['png','gif','bmp','svg','tif','jpg','jpeg'];
  return (n.indexOf(ext) > -1)
}
