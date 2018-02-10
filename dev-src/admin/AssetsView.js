var Asset = require('./Asset');
var AssetView = require('./AssetView');
import Vue from 'vue/dist/vue.js'

// view ALL assets

module.exports = class AssetsView{

  constructor(el){

    return new Vue({
      el:el,
      components:{
        'asset-view':AssetView
      },
      data:{
        assets:[],
      },
      template:`
        <div>
          <span v-for="asset in assets">
            <asset-view :asset="asset"></asset-view>
          </span>
        </div>
      `,
      methods:{
        load(){
          Asset.prototype.fetchAll((er,assets)=>{
            if (er){
              popup('Error fetching assets: '+er,'danger');
            }else{
              this.assets = assets.map(a=>new Asset(a));
            }
          });
        }
      }
    })


  }




}
