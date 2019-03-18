// manage settings

const api = require('./rpc').api;
var loadSettings = api.getSettings;
import Vue from 'vue/dist/vue.js';


module.exports = function SettingsManager (el){

  var labels = {}
  var labelsArr = [
    "title:Title",
    "postsPerPage:Posts per Page",
    "metadata:Metadata (json)",
    "description:Site Description",
    "authorName:Author Name",
    "avatar:Avatar URL",
    "siteUrl:Site base URL (format: https://www.site.com/)",
    "reverseOrder:Reverse order (newest on last page?)"
  ].map(str=>{
    var s = str.split(':');
    var key = s.shift();
    var val = s.join(':');
    labels[key] = val;

    return {
      key:key,
      label:val
    }
  })

  var settings = {};
  var settingsKeys = [];

  return new Vue({
    el:el,
    data:{labels,settings,settingsKeys,loading:false,},
    template:`
    <form @keydown.ctrl.83.prevent="save">
      <div>
        <div>
          <div class="field" v-for="key in settingsKeys">

            <b-checkbox v-if="typeof settings[key] == 'boolean'" v-model="settings[key]"><div class="label">{{ labels[key]?labels[key]:'' }}</div></b-checkbox>
            <label v-else class="label">{{ labels[key]?labels[key]:'' }}
              <input v-if="typeof settings[key] == 'number'" class="input" type="number" v-model="settings[key]"></input>
              <input v-else class="input" type="text" v-model="settings[key]"></input>
            </label>

          </div>
        </div>
      </div>
      <br>
      <div class="field is-grouped">
        <p class="control">
          <button class="button is-success" @click="save">💾︎ Save</button>
        </p>
        <p class="control">
          <button class="button is-warning" @click="reload">⮌︎ Revert Changes</button>
        </p>
      </div>
      <b-loading :is-full-page="true" :active="loading" :can-cancel="false"></b-loading>
    </form>`,
    methods:{
      load(reload){
        this.loading = true;
        api.getSettings((er,settings)=>{
          this.loading = false;
          if(er){
            window.popup(er,'danger','error loading settings')
          }else{
            this.settings = settings;
            Object.keys(settings).sort().forEach(k=>{
              if (this.settingsKeys.indexOf(k) == -1){
                this.settingsKeys.push(k);
              }
            });
            if (reload === true){
              window.popup('reverted settings to last save','success',);
            }
          }
        });
      },
      reload(){
        return this.load(true)
      },
      save(){
        api.setSettings(this.settings,er=>{
          if(er){
            window.popup(er,'danger','error saving settings');
          }else{
            window.popup('saved settings','success');
            window.startBuild();
          }
        })
      }
    }

  })

}
