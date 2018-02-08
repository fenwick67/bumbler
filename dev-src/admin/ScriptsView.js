var _ = require('lodash');

const api = require('./rpc').api;

module.exports = class ScriptsView{

  constructor(element,options){
    this.list = document.createElement('div');
    this.list.innerHTML = 'loading...';
    element.appendChild(this.list);
    this._scriptNames = [];
    this.load();
  }

  load(){
    api.getScripts((er,data)=>{
      if(!er){
        this.scriptNames = data;
        this.loaded = true;
      }else{
        popup(er,'danger','Error fetching scripts:')
      }
    });
  }


  get scriptNames(){
    return this._scriptNames;
  }

  set scriptNames(val){
    var self = this;

    self._urls = val;
    if (val.length == 0){
      return self.list.innerHTML = 'No scripts found!  Drop some in _bumblersrc/scripts.'
    }

    // update DOM
    self.list.innerHTML = '';

    val.forEach((name)=>{
      var button = document.createElement('a');
      button.classList.add('button');
      button.classList.add('is-primary');
      button.innerHTML = name;

      button.addEventListener('click',()=>{
        var ok = false;
        fetch('/admin/script/'+name+'/run',{credentials:'include',method:'POST'}).then(response=>{
          ok = response.ok;
          return response.text();
        }).then(responseText=>{
          if (ok){
            popup(responseText,'success',name+' ran successfully')
          }else{
            popup(responseText,'error','error running '+name)
          }
        })

      })

      self.list.appendChild(button);

    })

  }


}
