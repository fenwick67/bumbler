var _ = require('lodash');
const api = require('./rpc').api;

module.exports = class CustomPageEditor{

  constructor(element,options){
    return;
  }

  load(id){
    api.getCustomPages((er,pages)=>{
      if(!er){
        self.setPages(pages);
      }else{
        popup(data,'danger','Error fetching pages:')
      }
    })
  }

  clear(){

  }


}
