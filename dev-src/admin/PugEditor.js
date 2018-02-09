const _ = require('lodash');
const pug = require('pug');
const api = require('./rpc').api;


// text editor element
class FileEditor{

  constructor(href,element,type,opts){
    this.opts = opts||{};
    this.canDelete = this.opts.canDelete || false;
    this.element = element;
    this.href = href;

    // buttons
    this.buttonField = document.createElement('div');
    this.buttonField.setAttribute('class','field is-grouped')

    this.deleteButton = document.createElement('button');
    this.deleteButton.setAttribute('class','button is-danger');
    this.deleteButton.innerHTML = "Delete";
    var deleteButtonContain = document.createElement('p');
    deleteButtonContain.setAttribute('class','control')
    deleteButtonContain.appendChild(this.deleteButton);

    this.saveButton = document.createElement('button');
    this.saveButton.setAttribute('class','button is-primary');
    this.saveButton.innerHTML = "💾&#xFE0E; Save";
    var saveButtonContain = document.createElement('p');
    saveButtonContain.setAttribute('class','control')
    saveButtonContain.appendChild(this.saveButton);

    this.revertButton = document.createElement('button');
    this.revertButton.setAttribute('class','button is-warning');
    this.revertButton.innerHTML = "⮌&#xFE0E; Revert Changes";
    var revertButtonContain = document.createElement('p');
    revertButtonContain.setAttribute('class','control')
    revertButtonContain.appendChild(this.revertButton);

    // text area
    var textField = document.createElement('div');
    textField.setAttribute('class','field')
    var p = document.createElement('p');
    p.setAttribute('class','control')
    textField.appendChild(p);
    this.textarea = document.createElement('textarea');
    this.textarea.name="data";
    this.textarea.setAttribute('class','textarea textedit');
    p.appendChild(this.textarea);
    element.appendChild(textField);

    this.buttonField.appendChild(saveButtonContain);
    this.buttonField.appendChild(revertButtonContain);
    if (this.canDelete){
      this.buttonField.appendChild(deleteButtonContain);
    }
    element.appendChild(this.buttonField);

    var self = this;
    this.deleteButton.addEventListener('click',()=>self.delete());
    this.saveButton.addEventListener('click',()=>self.save());
    this.revertButton.addEventListener('click',()=>self.load(true));
    this.textarea.addEventListener('keydown',e=>self.keydown(e),false);
  }

  save(){
    var contents = this.textarea.value;
    var ok = true;
    fetch(this.href,{
      credentials: "include",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: "POST",
      body: JSON.stringify({data:contents})
    }).then(req=>{
      ok = req.ok;
      return req.text();
    }).then(text=>{
      if (ok){
        this.textarea.value = text;
        window.popup('saved','success')
      }else{
        window.popup('error: '+text,'danger','Error Saving')
      }
    }).catch(er=>{
      window.popup('error: '+er,'danger','Error Saving')
    })
  }

  delete(){
    var contents = this.textarea.value;

    api.deleteFile(this.href,er=>{
      if(er){
        return window.popup('error: '+er,'danger','Error Deleting');
      }else{
        window.popup('deleted','success');
      }

    })
  }

  load(reload){
    // load the data
    var ok = true;
    fetch(this.href,{credentials:'include'}).then(req=>{
      ok = req.ok;
      return req.text();
    }).then(text=>{
      if (!ok){
        window.popup('error: '+text,'danger','Error Loading')
      }else{
        this.textarea.value = text;
        if (reload){
          window.popup('Reverted to last save','warning')
        }
      }
    }).catch(er=>{
      window.popup('error: '+er,'danger','Error Loading')
    });
  }

  keydown(e){
    console.log(e);
    if ( e.key == 's' && (e.metaKey || e.ctrlKey) ){
      this.save();
      e.preventDefault();
      return false;
    }
    if (e.key == 'Tab'){
      var start = this.textarea.selectionStart;
      var end = this.textarea.selectionEnd;

      var value = this.textarea.value;

      // set textarea value to: text before caret + tab + text after caret
      this.textarea.value = (value.substring(0, start)+ "  "+ value.substring(end));

      // put caret at right position again (add one for the tab)
      this.textarea.selectionStart = this.textarea.selectionEnd = start + 2;

      // prevent the focus lose
      e.preventDefault();
    }
  }

}


class PugEditor extends FileEditor{
  constructor(href,element,type,opts){
    super(href,element,type,opts);
  }

  save(){
    var contents = this.textarea.value;

    var errors = getTemplateErrors(this.textarea.value);

    if (errors){
      window.popup(errors.toString(),'danger','Error Validating template');
    }else{
      // actually save
      api.setTemplate(contents,er=>{
        if(!er){
          window.popup('Saved template','success')
        }else{
          window.popup(er.toString(),'warning','error saving')
        }
      })
    }

  }

  load(reload){
    // load the data
    api.getTemplate((er,text)=>{
      if (er){
        window.popup(er,'danger','Error Loading')
      }else{
        this.textarea.value = text;
        if (reload){
          window.popup('Reverted to last save','warning')
        }
      }
    });

  }


  validate(){
    return;
  }
}

module.exports = PugEditor;

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
