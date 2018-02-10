// show a list of posts

const api = require('./rpc').api;
import Vue from 'vue/dist/vue.js'

function PostList(el) {

    this.currentId='';
    this.loading = false;
    this.postIds = [];

    var view = new Vue({
      el:el,
      data:{
        currentId:'',
        loading: false,
        postIds: []
      },
      template:`
      <div>
        <div class="level"> Enter a post ID to edit, or pick from a recent one below
          <div class="level">
            <input class="input" placeholder="01BJCTAYSSR4T6K99WCTSBTFMG" type="text" v-model="currentId">
            <a class="button" target="_top" @click="view(currentId)">View</a>
            <a class="button is-primary" @click="edit(currentId)">Edit</a>
          </div>
        </div>
        <div>
          <div v-if="loading">
            <span> Loading... </span>
          </div>
          <div class="level" v-for="id in postIds">
            <pre>{{ id }}</pre>
             <a class="button is-default" @click="view(id)">View</a>
             <a class="button is-primary" @click="edit(id)">Edit</a>
          </div>
        </div>
      </div>
      `,

      methods:{
        view(id){
          window.location.href=`/post/${id}.html`
        },
        edit(id){
          window.location.href=`#post/edit?id=${id}`
        },
        load(){
          this.loading=true;
          api.getPosts((er,data)=>{
            this.loading=false;
            if (!er){
              this.postIds = data;
            }else{
              popup(er,'danger','Error getting posts:')
            }
          })
        }
      }
    })

    return view;

}

module.exports = PostList
