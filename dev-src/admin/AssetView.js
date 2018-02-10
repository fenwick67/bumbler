import Vue from 'vue/dist/vue.js'

// view into an asset
// i.e. in a list or whatever
module.exports =  {
  props:['asset'],
  data:function(){
    return {deleted:false}
  },
  template:`
    <div class="asset" >

      <span v-if="!asset">No asset loaded</span>

      <img v-if="asset.type == 'image' " class="thumb" :src="asset.href"></img>
      <audio v-else-if="asset.type == 'audio' " controls class="thumb" :src="asset.href"></audio>
      <video v-else-if="asset.type == 'video' " controls class="thumb" :src="asset.href"></video>
      <span v-else class="thumb"></span>

      <b>{{ asset.href }}</b>
      <a class="button is-default" :href="asset.href" target="_top">view</a>
      <a class="button is-danger" @click="deleteAsset" >Delete</a>
    </div>
  `,
  methods:{
    deleteAsset:function(){
      if (!window.confirm("Do you REALLY want to delete "+self.asset.href+"?\nNote that this won't delete the post")){
        return;
      }
      this.asset.delete(er=>{
        if (er){
           popup(er,'danger','Error deleting asset:');
           return;
        }

        popup('Deleted asset','success');
        this.deleted = true;

      });

    }
  }
}
