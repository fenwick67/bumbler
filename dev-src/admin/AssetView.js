// view into an asset
// i.e. in a list or whatever
module.exports = class AssetView{
  constructor(asset,element,options){
    if (!options){
      var options = {};
    }
    var inner = `<span class="thumb">(unknown type)</span>`;
    console.log(asset);
    if (asset.type == 'audio'){
      inner = `<audio controls class="thumb" src="${asset.href}"></audio>`
    }else if (asset.type == 'video'){
      inner = `<video controls class="thumb" src="${asset.href}"></video>`
    }else if (asset.type == 'image'){
      inner = `<img class="thumb" src="${asset.href}"></img>`
    }
    if (options.link !== false){
      inner += `<b>${asset.href}</b><a href="${asset.href}">view</a>`;
    }
    element.innerHTML = inner;
    element.classList.add('asset')
  }
}
