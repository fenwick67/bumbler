// view into an asset

// this is a Vue component!
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
      <a class="button is-default" :href="asset.href" target="_top">👁️ View</a>
      <a class="button is-danger" @click="deleteAsset" >❌&#xFE0E; Delete</a>
    </div>
  `,
  methods:{
    deleteAsset:function(){
      if (!window.confirm("Do you REALLY want to delete "+this.asset.href+"?\nNote that this won't delete any posts that contain it.")){
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
