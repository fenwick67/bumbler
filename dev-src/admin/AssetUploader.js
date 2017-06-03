var Asset = require('./Asset');
var _ = require('lodash');

module.exports = class AssetUploader {
  constructor(element){
    var self = this;
    this.assets = [];
    this.files = [];
    this.thumbnails = [];

    var label = document.createElement('label');
    label.innerHTML = "Upload Files"
    label.classList.add('label');

    var input = document.createElement('input');
    input.classList.add('box')
    input.setAttribute('type','file')
    input.setAttribute('multiple','multiple')
    element.appendChild(label);
    element.appendChild(input)

    self.input = input;

    var gallery = document.createElement('div');
    this.gallery = gallery;
    gallery.setAttribute('class','gallery');
    element.appendChild(gallery);


    input.addEventListener('change', function(){
        for (var i = 0; i < this.files.length; i ++){
          self.addAssetFromFile(this.files[i]);
        }
    }, false);

  }

  addAssetFromFile(file){
    var self = this;
    var a = new Asset('/assets/'+file.name);
    self.assets.push(a);
    var thumb = self.previewImage(file,a);
    self.thumbnails.push(thumb);
    self.files.push(file);
    console.log(file)
  }

  addAssetFromHref(href){
    var self = this;
    var a = new Asset(href);
    self.assets.push(a);
    var thumb = self.previewImage(null,a);
    self.thumbnails.push(thumb);
    //self.files.push(this.files[i]);
    //console.log(this.files[i])
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
    delBtn.classList.add('is-warning')
    delBtn.innerHTML = 'remove';
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

  upload(file,callback){
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
