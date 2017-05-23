// view into an asset
// i.e. in a list or whatever
module.exports = class AssetView{
  constructor(asset,element,options){
    this.asset = asset;
    this.element = element;

    if (!options){
      var options = {};
    }
    var inner = `<span class="thumb">(unknown type)</span>`;
    if (asset.type == 'audio'){
      inner = `<audio controls class="thumb" src="${asset.href}"></audio>`
    }else if (asset.type == 'video'){
      inner = `<video controls class="thumb" src="${asset.href}"></video>`
    }else if (asset.type == 'image'){
      inner = `<img class="thumb" src="${asset.href}"></img>`
    }
    if (options.link !== false){
      inner += `<b>${asset.href}</b><a class="button is-default" href="${asset.href}">view</a>`;
    }
    element.innerHTML = inner;
    element.classList.add('asset')

    this.deleteButton = document.createElement('a');
    this.deleteButton.classList.add('button')
    this.deleteButton.classList.add('is-danger')
    this.deleteButton.innerHTML = "Delete";
    element.appendChild(this.deleteButton);

    var self = this;
    this.deleteButton.addEventListener('click',e=>{
      e.preventDefault();
      if (!window.confirm("Do you REALLY want to delete "+self.asset.href+"?\nNote that this won't delete the post")){
        return;
      }
      self.asset.delete(er=>{
        if (er){
           popup(er,'danger','Error deleting asset:');
           return;
        }

        popup('Deleted asset','success');
        if (self.element.parentElement){// delet this
          self.element.parentElement.removeChild(self.element);
        }

      });
    })
  }
}
