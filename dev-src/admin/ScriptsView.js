var _ = require('lodash');
import Vue from 'vue/dist/vue.js'
const api = require('./rpc').api;

module.exports = function ScriptsView(element,options){

  var view = new Vue({
    el:element,
    data:{
      scriptNames:[],
      loaded:false
    },
    template:`
    <div>
      <div v-for="name in scriptNames">
        <a class="button is-primary" @click="runScript(name)">{{name}}</a>
      </div>
    </div>
    `,
    methods:{
      load(){
        api.getScripts((er,data)=>{
          if(!er){
            this.scriptNames = data;
            this.loaded = true;
          }else{
            popup(er,'danger','Error fetching scripts:')
          }
        });
      },
      runScript(name){
        api.runScript(name,function(er,result){
          if(er){
            popup(er,'error','error running script '+name);
          }else{
            popup(result,'success',name+' ran successfully');
          }
        });
      }
    }
  })

  view.load();

  return view;

}
