var _ = require('lodash');

module.exports = class CustomPageEditor{

  constructor(element,options){
    return;
  }

  load(id){
    var ok = false;
    var self = this;
    fetch('/admin/custom-pages',{credentials:'include'}).then(res=>{
      ok = res.ok;
      if(ok){
        return res.json()
      }else{
        return res.text();
      }
    }).then(data=>{
      if (ok){
        self.setPages(data);
      }else{
        popup(data,'danger','Error fetching pages:')
      }
    })
  }

  clear(){

  }


}
