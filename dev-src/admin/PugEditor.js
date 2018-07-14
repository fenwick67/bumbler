const _ = require('lodash');
const pug = require('pug');
const api = require('./rpc').api;
import Vue from 'vue/dist/vue.js'


// text editor element
class PugEditor{

  constructor(href,element,type,opts){
    var self = this;
    this.opts = opts||{};
    this.canDelete = this.opts.canDelete || false;
    this.element = element;
    this.pugTemplate='';
    this.loaded=false;

    // buttons
    return new Vue({
      el:element,
      data:self,
      template:`
        <span id="htmleditor" @keydown.ctrl.83.prevent="save">
          <div class="field">
            <p class="control">
              <textarea name="data" class="textarea textedit" style="height: 663px;" v-model="pugTemplate"></textarea>
            </p>
          </div>
          <div class="field is-grouped">
            <p class="control">
              <button class="button is-success" @click="save">💾︎ Save</button>
            </p>
            <p class="control">
              <button class="button is-warning" @click="load(true)">⮌︎ Discard Changes</button>
            </p>
          </div>
          <b-loading :is-full-page="true" :active="!loaded" :can-cancel="false"></b-loading>
        </span>
      `,
      methods:{
        load:function(reload){
          // load the data
          api.getTemplate((er,text)=>{
            if (er){
              window.popup(er,'danger','Error Loading')
            }else{
              this.loaded = true;
              self.pugTemplate = text;
              if (reload){
                window.popup('Reverted to last save','warning')
              }
            }
          });

        },
        save:function(){
          var contents = this.pugTemplate;

          var errors = getTemplateErrors(contents);

          if (errors){
            window.popup(errors.toString(),'danger','Error Validating template');
          }else{
            // actually save
            api.setTemplate(contents,er=>{
              if(!er){
                window.popup('Saved template','success')
                window.startBuild();
              }else{
                window.popup(er.toString(),'warning','error saving')
              }
            })
          }

        }

      }
    });

  }

}


module.exports = PugEditor;

// validation follows

function getTemplateErrors(tpl){
  try{
    var compiledFn = pug.compile(tpl);

    var sampleData = getSampleData();
    sampleData.forEach(function(d){
      var s = compiledFn(d);// compile it and do nothing with it
    });
  }catch(e){
    return e;
  }

  return null;
}

// this is from bumbler-themes
function getSampleData(){


  var lorem = ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas et mollis nunc, non mollis lacus. Donec pharetra lacus at mauris pulvinar, vestibulum lacinia ligula viverra. Curabitur semper lobortis nulla non efficitur. Aliquam cursus non tortor vitae mattis. Proin sagittis elit sed risus rutrum, sed pulvinar neque lacinia. Donec ac dui aliquam, placerat ligula et, imperdiet nunc. Donec vulputate massa non dui fermentum, nec rhoncus lorem feugiat. Nulla vitae augue quis lectus lacinia fermentum at ac ex. Cras ac mauris et mi dictum pretium at non felis. Aenean lobortis metus in ante pellentesque, mattis aliquam ex accumsan. Nunc ut vehicula augue. Donec sed cursus erat. '

  var loremIpsum = `<h1>HTML Ipsum Presents</h1>
  <p><strong>Pellentesque habitant morbi tristique</strong> senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper. <em>Aenean ultricies mi vitae est.</em> Mauris placerat eleifend leo. Quisque sit amet est et sapien ullamcorper pharetra. Vestibulum erat wisi, condimentum sed, <code>commodo vitae</code>, ornare sit amet, wisi. Aenean fermentum, elit eget tincidunt condimentum, eros ipsum rutrum orci, sagittis tempus lacus enim ac dui. <a href="#">Donec non enim</a> in turpis pulvinar facilisis. Ut felis.</p>
  <h2>Header Level 2</h2>
  <ol>
     <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
     <li>Aliquam tincidunt mauris eu risus.</li>
  </ol>
  <blockquote><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut a est eget ligula molestie gravida. Curabitur massa. Donec eleifend, libero at sagittis mollis, tellus est malesuada tellus, at luctus turpis elit sit amet quam. Vivamus pretium ornare est.</p></blockquote>
  <h1>Header Level 1</h1>
  <h2>Header Level 2</h2>
  <h3>Header Level 3</h3>
  <h4>Header Level 4</h4>
  <h5>Header Level 5</h5>
  <h6>Header Level 6</h6>
  <ul>
     <li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
     <li>Aliquam tincidunt mauris eu risus.</li>
  </ul>
  <p>Try some <code>code</code> on for size!</p>
  <pre><code>#header h1 a {
    display: block;
    width: 300px;
    height: 80px;
  }
  </code></pre>`

  var data = {
    _:_,
    linkTo:function(){return '#'},
    site:{
      authorName:"Your Name",
      title:"Site Title",
      description: 'Site Description goes here.  It will look like this.  ',
      avatar: '../../placeholders/avatar.png',
      pageCount:10,
      tags:[
        {name:"photos",count:25},
        {name:"development",count:14},
        {name:"math",count:5}
      ]
    },
    page:{
      posts:[{
        title:"A Post!",
        id:"ABCDEFG",
        caption:'<p>These are some photos!</p>',
        tags:['math','development'],
        permalink:"#",
        date:new Date('October 30, 2017'),
        englishDate:'October 30, 2017',
        assets:[
          {
            type:"image",
            widget:'<img src="../../placeholders/asset-1.jpg"></img>',
            mimetype:"image/jpeg",
            href:"#"
          },{
            type:"image",
            widget:'<img src="../../placeholders/asset-2.jpg"></img>',
            mimetype:"image/jpeg",
            href:"#"
          },
        ],
      },
      {
        caption:loremIpsum,
        id:"ABCDEFH",
        title:"Another Post",
        permalink:"#",
        date:new Date('October 10, 2017'),
        englishDate:'October 10, 2017',
        assets:[
          {
            type:"image",
            widget:'<img src="../../placeholders/asset-1.jpg"></img>',
            mimetype:"image/jpeg",
            href:"#"
          }
        ],
      }],
      isCustom:false,
      isIndex:true,
      number:1,
      customContent:null,
      links:{
        nextPage:'#',
        previousPage:null,
        firstPage:"#",
        lastPage:"#"
      }
    }
  };

  // clone posts
  data.page.posts.push(_.cloneDeep(data.page.posts[0]));
  data.page.posts[data.page.posts.length-1].title=null;
  data.page.posts[data.page.posts.length-1].assets.push(data.page.posts[0].assets[0]);

  // custom page
  var data2 = _.cloneDeep(data);
  data2.page.posts = null;
  data2.page.isCustom = true;
  data2.page.isIndex = false;
  data2.page.links = {};
  data2.page.customPage = {
    title:"Custom",
    content:"<p>This is some custom content for the page!</p><p>"+lorem+"</p>"
  };

  // also test last page of a tag
  var data3 = _.cloneDeep(data);
  data3.page.number = 10;
  data3.page.links.nextPage = null;
  data3.page.isIndex = false;
  data3.page.tag = "math";
  data3.page.links.previousPage="#";
  data3.page.posts.map(function(post){
    if (!post.tags){post.tags = []}
    if (post.tags.indexOf('math') > -1){return;}
    post.tags.push('math');
    return post;
  });

  return [data,data2,data3];
}
