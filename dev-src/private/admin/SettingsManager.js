// manage settings

var _ = require('lodash');

module.exports = class SettingsManager extends Object{
  constructor(el){
    super();

    this.labels = {
      publishUrl: "Git Publish URL",
      publishBranch: "Git Publish Branch",
      title:"Title",
      postsPerPage:"Posts per Page",
      metadata:"Metadata (json)",
      description:"Site Description",
      authorName:"Author Name",
      avatar:"Avatar URL",
      siteUrl:"Site base URL (format: https://www.site.com/)"
    };

    this.defaultKeys = Object.keys(this.labels);
    this.defaults = _.mapValues(this.labels,l=>'');

    var form = this.autoFormFactory(this.defaults);
    this.form = form;
    this.formContain = document.createElement('div');
    var btn = document.createElement('button');
    var revertBtn = document.createElement('button');
    var btnContain = document.createElement('div')
    btnContain.setAttribute('class','field')
    btn.setAttribute('class','button is-primary');
    btn.innerHTML = "💾&#xFE0E; Save";
    revertBtn.setAttribute('class','button is-warning');
    revertBtn.innerHTML = '⮌&#xFE0E; Revert Changes';
    btnContain.appendChild(btn);
    btnContain.appendChild(revertBtn);


    this.formContain.appendChild(form);
    el.appendChild(this.formContain);
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
      dat[input.getAttribute('name')] = input.value;
      console.log(input.value)
    })
    var ok = false;

    fetch('/admin/settings',{
      method:"POST",
      body:JSON.stringify(dat),
      headers:{'Content-Type': 'application/json'},
      credentials: "include"
    }).then(res=>{
      ok = res.ok;
      if (ok){
        return res.json();
      }else{
        throw new Error('bad response')
      }
    }).then(json=>{
      var formData = _.clone(json);
      var parent = this.form.parentElement;
      parent.removeChild(this.form);

      this.form = this.autoFormFactory(formData);
      parent.appendChild(this.form);
      popup("Settings saved.",'success',)

    }).catch(e=>{
      popup(e,'danger','Error saving settings')
    })


  }
  load(alert){
    var ok = false;
    fetch('/admin/settings',{credentials: "include"}).then(res=>{
      ok = res.ok;
      return res.json();
    }).then(json=>{
      var formData = _.clone(json);
      var parent = this.form.parentElement;
      parent.removeChild(this.form);

      this.form = this.autoFormFactory(formData);
      parent.appendChild(this.form);
      if(alert){
        window.popup('Reverted settings to last save.','warning')
      }

    }).catch(e=>{
      popup(e,'danger','Error fetching settings')
    })

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
      l.classList = "label";
      var label = this.labels[key];
      l.innerHTML = label||key;
      var i = document.createElement('input');
      i.name = key;
      i.type = "text";
      i.value = value;
      i.classList = "input";
      l.appendChild(i);
      el.appendChild(l);

      ret.appendChild(el);
    });

    return ret;
  }

}
