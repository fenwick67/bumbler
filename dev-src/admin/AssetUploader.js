var Asset = require('./Asset');

module.exports = class AssetUploader {
  constructor(element){
    var self = this;
    this.assets = [];
    this.files = [];

    var input = document.createElement('input');
    input.setAttribute('type','file')
    input.setAttribute('multiple','multiple')
    element.appendChild(input);
    self.input = input;

    var gallery = document.createElement('div');
    this.gallery = gallery;
    gallery.setAttribute('class','gallery');
    element.appendChild(gallery);


    input.addEventListener('change', function(){
        for (var i = 0; i < this.files.length; i ++){
          self.previewImage(this.files[i]);
          self.files.push(this.files[i]);
          console.log(this.files[i])
          self.assets.push(new Asset('/assets/'+this.files[i].name));
        }
    }, false);

  }

  previewImage(file) {

    var thumb = document.createElement("div");
    thumb.classList.add('thumbnail'); // Add the class thumbnail to the created div
    var img = document.createElement("img");
    img.file = file;
    thumb.appendChild(img);
    this.gallery.appendChild(thumb);
    // Using FileReader to display the image content
    var reader = new FileReader();
    reader.onload = (function(aImg) { return function(e) { aImg.src = e.target.result; }; })(img);
    reader.readAsDataURL(file);
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
