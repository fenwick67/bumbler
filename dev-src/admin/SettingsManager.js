// manage settings

var _ = require('lodash');
var loadSettings = require('./loadSettings');
const api = require('./rpc').api;

module.exports = class SettingsManager {
  constructor(el){

    this.labels = {
      title:"Title",
      postsPerPage:"Posts per Page",
      metadata:"Metadata (json)",
      description:"Site Description",
      authorName:"Author Name",
      avatar:"Avatar URL",
      siteUrl:"Site base URL (format: https://www.site.com/)",
      reverseOrder:"Reverse order (newest on last page?) "
    };

    this.defaultKeys = Object.keys(this.labels);
    this.defaults = _.mapValues(this.labels,l=>'');
    this.defaults.reverseOrder = false;

    var form = this.autoFormFactory(this.defaults);
    this.form = form;
    this.formContain = document.createElement('div');
    var btn = document.createElement('button');
    var revertBtn = document.createElement('button');
    var btnContain = document.createElement('div');

    var p1 = document.createElement('p');
    var p2 = document.createElement('p');
    p1.setAttribute('class','control');
    p2.setAttribute('class','control');

    btnContain.setAttribute('class','field is-grouped')
    btn.setAttribute('class','button is-primary');
    btn.innerHTML = "💾&#xFE0E; Save";
    revertBtn.setAttribute('class','button is-warning');
    revertBtn.innerHTML = '⮌&#xFE0E; Revert Changes';
    btnContain.appendChild(p1);
    p1.appendChild(btn);
    btnContain.appendChild(p2);
    p2.appendChild(revertBtn);


    this.formContain.appendChild(form);
    el.appendChild(this.formContain);
    el.appendChild(document.createElement('br'));
    el.appendChild(btnContain);

    var self = this;
    var _save = (e)=>{
      e.preventDefault();
      self.save()
      return false;
    }
    var _load = e=>{
      e.preventDefault();
      self.load(true);
      return false;
    }
    btn.addEventListener('click',_save)
    revertBtn.addEventListener('click',_load);

    self.load();

  }
  save(){
    var dat = {};
    _.each(this.form.querySelectorAll('input'),function(input){
      if (input.getAttribute('type') == 'text'){
        dat[input.getAttribute('name')] = input.value;
      }else if (input.getAttribute('type') == 'checkbox'){
        dat[input.getAttribute('name')] = input.checked;
      }
      console.log(input.getAttribute('name'),dat[input.getAttribute('name')])
    })

    api.setSettings(dat,function(er){
      if(!er){
        popup("Settings saved.",'success',)
      }else{
        popup(er,'danger','Error saving settings')
      }
    });


  }
  load(alert){

    api.getSettings((er,formData)=>{
      if (er){
        return window.popup(er,'danger','Error getting settings')
      }
      var parent = this.form.parentElement;
      parent.removeChild(this.form);

      this.form = this.autoFormFactory(formData);
      parent.appendChild(this.form);
      if(alert){
        window.popup('Reverted settings to last save.','warning')
      }

    });

  }

  autoFormFactory(keysValues){
    var ret = document.createElement('div');

    var extendedData = _.extend({},this.defaults,keysValues)
    console.log(extendedData)
    var orderedKeys = _.sortBy(_.keys(extendedData));

    _.each(orderedKeys,(key)=>{
      var value = extendedData[key] || this.defaults[key] ;
      console.log(value);
      var el = document.createElement('div');
      el.setAttribute('class','field')

      var l = document.createElement('label');

      var i;

      if (typeof value == 'boolean'){
        l.classList = "checkbox label";
        var label = this.labels[key];
        l.innerHTML = label||key;
        var i = document.createElement('input');
        i.name = key;
        i.value = value;
        i.type="checkbox";
        i.checked=value?"checked":"";
      }else{
        l.classList = "label";
        var label = this.labels[key];
        l.innerHTML = label||key;
        var i = document.createElement('input');
        i.name = key;
        i.value = value;
        i.type = "text";
        i.classList = "input";
      }

      l.appendChild(i);
      el.appendChild(l);

      ret.appendChild(el);
    });

    return ret;
  }

}
