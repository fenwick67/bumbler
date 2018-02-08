var _ = require('lodash');
var ulid = require('ulid');
const api = require('./rpc').api;

module.exports = class CustomPageList{

  constructor(element,options){
    var self = this;
    this.element = element;
    this.table = document.createElement('table');
    this.table.setAttribute('class','table');
    this.table.innerHTML = '<thead><tr><th>title</th><th>route</th><th></th></tr></thead>'
    this.list = document.createElement('tbody');
    this.table.appendChild(this.list);
    this.element.appendChild(this.table);
    this.pages = [];
    this.editor = document.createElement('div');
    this.form = document.createElement('form');
    this.form.innerHTML = `
    <input type="text" name="id" style="display:none">
    <label class="label">Title
      <p class="control">
        <input class="input" type="text" name="title">
      </p>
    </label>
    <label class="label">Filename / route
      <p class="control">
        <input class="input" type="text" name="route">
      </p>
    </label>
    <label class="label">Content (HTML fragment)
      <p class="control">
        <textarea name="content" class="textarea textedit">
      </p>
    </label>
    `;
    this.editor.appendChild(this.form);

    var submitButton = document.createElement('a');
    submitButton.setAttribute('class','button is-success');
    submitButton.innerHTML = 'Save';
    this.form.appendChild(submitButton);
    submitButton.addEventListener( 'click', e=>self.savePage() );

    var cancelButton = document.createElement('a');
    cancelButton.setAttribute('class','button is-warning');
    cancelButton.innerHTML = 'Cancel';
    this.form.appendChild(cancelButton);
    cancelButton.addEventListener( 'click', e=> {self.clearForm(); self.hideEditor()} );

    var newButton = document.createElement('a');
    newButton.setAttribute('class','button is-success');
    newButton.innerHTML = 'Add New Page';
    this.element.appendChild(newButton);
    newButton.addEventListener('click',e=>{self.newPage()})

    this.element.appendChild(this.editor);

    this.hideEditor();
  }

  setPages(pages){
    var self = this;
    this.clear();
    this.pages = pages;
    // populate
    pages.forEach(page=>{
      var item = document.createElement("tr");
      item.innerHTML = `<td>${page.title}</td><td><a href="/${page.route}.html" target="_blank">${page.route}</a></td>`;

      var btn = document.createElement('button');
      btn.setAttribute('class','button is-primary');
      btn.innerHTML = 'Edit';
      btn.addEventListener('click',function(){
        self.editPage(page.id);
      })
      item.appendChild(btn);

      var delBtn = document.createElement('button');
      delBtn.setAttribute('class','button is-danger');
      delBtn.innerHTML = 'Delete';
      delBtn.addEventListener('click',function(){
        self.deletePage(page.id);
      })
      item.appendChild(delBtn);

      this.list.appendChild(item);
    });
  }

  editPage(id){
    this.load(er=>{
      var toEdit = _.find(this.pages,{id});
      this.currentPost = toEdit;
      ['route','title','content','id'].forEach(s=>{
        this.form.querySelector('[name="'+s+'"]').value = toEdit[s]||'';
      })
      this.showEditor();
    });
  }

  newPage(){
    var id = ulid();
    var toEdit = {id};
    ['route','title','content','id'].forEach(s=>{
      this.form.querySelector('[name="'+s+'"]').value = toEdit[s]||'';
    })
    this.showEditor();
  }

  savePage(){
    console.log('saving');
    var page = {};
    var ok = true;
    ['route','title','content','id'].forEach(s=>{
      page[s] = this.form.querySelector('[name="'+s+'"]').value;
      if (!page[s]){
        ok = false;
        window.popup('Page is missing attribute: '+s,'danger');
      }
    });
    if (!ok){
      return;
    }
    // now POST it
    this.submitPage(page,er=>{
      if (er){
        window.popup(er,'danger')
      }else{
        this.clearForm();
        window.popup('saved page successfully','success');
        this.hideEditor();
      }
    });

  }

  clearForm(){
    ['route','title','content','id'].forEach(s=>{
      this.form.querySelector('[name="'+s+'"]').value = '';
    });
  }

  showEditor(){
    this.editor.style='';
  }
  hideEditor(){
    this.editor.style='display:none';
  }

  clear(){
    this.list.innerHTML = '';
    // clear editor as well
    this.clearForm();
  }

  load(done){
    var ok = false;
    var self = this;
    var _done = function(e){if (done){done(e)}}
    api.getCustomPages((er,data)=>{
      if(!er){
        self.setPages(data);
        _done(null)
      }else{
        popup(er,'danger','Error fetching pages:')
        _done(new Error(data))
      }
    });
  }

  submitPage(page,done){
    var self = this;
    var _done = function(e){if (done){done(e)}}
    api.putCustomPage(page,er=>{
      if(er){
        popup(data,'danger','Error submitting custom page:')
      }
      _done(er);
    })
  }

  deletePage(id,done){
    var ok = false;
    var self = this;
    var _done = function(e){if (done){done(e)}}
    if (!window.confirm("are you SURE you want to delete this page?")){
      return;
    }
    fetch('/admin/custom-page?id='+id,{
      credentials:'include',
      method:"DELETE",
      headers:{'Content-Type': 'application/json'}
    }).then(res=>{
      ok = res.ok;
      return res.text();
    }).then(data=>{
      if (ok){
        self.load(_done);
        popup('Deleted custom page','warning')
      }else{
        popup(data,'danger','Error deleting custom page:')
        _done(new Error(data))
      }
    });
  }

}
