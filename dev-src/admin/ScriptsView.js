var _ = require('lodash');

module.exports = class ScriptsView{

  constructor(element,options){
    this.list = document.createElement('div');
    this.list.innerHTML = 'loading...';
    element.appendChild(this.list);
    this._scriptNames = [];
    this.load();
  }

  load(){
    // load scripts from server
    var ok = false;
    fetch('/admin/scripts',{credentials:"include"}).then(res=>{
      ok = res.ok;
      if(ok){
        return res.json();
      }else{
        return res.text();
      }
    }).then(data=>{
      if (ok){
        this.scriptNames = data;
      }else{
        popup(data,'danger','Error fetching scripts:')
      }
      this.loaded = true;
    }).catch(function(e){
      popup(e,'danger','Error:')
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
