var Asset = require('./Asset');
var AssetView = require('./AssetView');

// view ALL assets

module.exports = class AssetsView{

  constructor(el){
    this.el = el;
    this.el.innerHTML = 'loading...';
    this.assets = [];
    this.assetViews = [];
  }

  load(){
    Asset.prototype.fetchAll((er,assets)=>{
      if (er){
        popup('Error fetching assets: '+er,'danger');
      }else{
        this.assets = assets;
        this.render();
      }
    });
  }

  add(asset){
    var assetContain = document.createElement('div');
    var av = new AssetView(asset,assetContain);
    this.assetViews.push(av);
    this.el.appendChild(assetContain);
  }

  render(){
    this.el.innerHTML = '';
    this.assetViews = [];
    this.assets.forEach(a=>{
      this.add(a);
    });
  }


}
