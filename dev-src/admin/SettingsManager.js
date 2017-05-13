// manage settings

var _ = require('lodash');

function formFactory(keysLabels){

  var ret = document.createElement('div');

  _.each(keysLabels,function(label,key){
    var el = document.createElement('div');
    el.setAttribute('class','field')
    el.innerHTML = `
    <label class="label">${label}
      <input class="input" type="text" name="${key}">
    </label>`
    ret.appendChild(el);
  });

  return ret;
}


module.exports = class SettingsManager extends Object{
  constructor(el){
    super();
    var kl = {
      publishUrl: "Git Publish URL",
      publishBranch: "Git Publish Branch",
      title:"Title",
      postsPerPage:"Posts per Page"
    }
    var form = formFactory(kl);
    var btn = document.createElement('button');
    var btnContain = document.createElement('div')
    btnContain.setAttribute('class','field')
    btn.setAttribute('class','button is-primary');
    btn.innerHTML = "💾&#xFE0E; Save";
    btnContain.appendChild(btn);
    form.appendChild(btnContain);

    el.appendChild(form);

    var self = this;
    var _save = (e)=>{
      e.preventDefault();
      self.save()
      return false;
    }
    btn.addEventListener('click',_save)

    self.load();

  }
  save(){
    console.log('TODO save');
  }
  load(){
    console.log('todo: load')
  }
}
