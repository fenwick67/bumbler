const api = require('./rpc').api;
import Vue from 'vue/dist/vue.js';
import { ulid } from 'ulid';

module.exports = function(element,options){
    var self = this;
    this.element = element;

    var view = new Vue({
      el:element,
      data:function(){
        return {
          pages:[],
          editing:false,
          currentPage:null,
          loaded:false
        }
      },
      template:`
      <div>
        <table class="table">
          <thead>
            <tr>
              <th>title</th>
              <th>route</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="page in pages">
              <td>{{ page.title }}</td>
              <td>
                <a :href="'/'+page.route+'.html'" target="_blank">{{ page.route }}</a>
              </td>
              <button class="button is-link" @click="edit(page.id, $event)">✏️ Edit</button>
              <button class="button is-danger" @click="deletePage(page, $event)">❌&#xFE0E; Delete</button>
            </tr>
          </tbody>
        </table>
        <a class="button is-link" @click="createNew" v-if="!currentPage">➕&#xFE0E; Add New Page</a>
        <div v-if="currentPage">
          <form>
            <input name="id" style="display:none" type="text">
              <label class="label">Title
                <p class="control">
                  <input class="input" type="text" v-model="currentPage.title">
                </p>
              </label>
              <label class="label">Filename / route
                <p class="control">
                  <input class="input" type="text" v-model="currentPage.route">
                </p>
              </label>
              <label class="label">Content (HTML fragment)
                <p class="control">
                  <textarea name="content" class="textarea textedit" v-model="currentPage.content">
                  </textarea>
                </p>
              </label>
            <a class="button is-success" @click="save(currentPage, $event)">💾︎ Save</a>
            <a class="button is-warning" @click="cancel">⮌︎ Cancel</a>
          </form>
        </div>
        <b-loading :is-full-page="true" :active="!loaded" :can-cancel="false"></b-loading>
      </div>
      `,
      methods:{
        edit(id){
          this.loadAll(er=>{
            console.log(id);
            console.log(this.pages);
            this.currentPage = this.pages.filter(p=>p.id == id)[0];
          });
        },
        deletePage(page){
          api.deleteCustomPage(page,er=>{
            if(er){
              popup(data,'danger','Error deleting custom page:');
            }else{
              popup('Deleted custom page: '+page.title,'success')
            }
            this.loadAll()
            window.startBuild();
          })
        },
        createNew(){
          var id = ulid();
          var p =  {id};
          this.pages.push(p);
          this.currentPage=p;
        },
        save(page){
          api.putCustomPage(page,er=>{
            if(er){
              popup(data,'danger','Error submitting custom page:')
            }else{
              popup('saved page','success')
              this.currentPage = null;
              window.startBuild();
            }
          })
        },
        loadAll(done){
          var _done = function(e){if (done){done(e)}}
          api.getCustomPages((er,data)=>{
            this.loaded = true;
            if(!er){
              this.pages = data;
              _done(null)
            }else{
              popup(er,'danger','Error fetching pages:')
              _done(new Error(data))
            }
          });
        },
        load(){
          return this.loadAll();
        },
        cancel(){
          this.currentPage = null;
          return this.loadAll();
        }
      }
    });

    return view;

}
