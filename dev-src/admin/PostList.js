// show a list of posts

class PostList {

  constructor(el){
    var self = this;
    this.element = el;

    this.enterElement = document.createElement('div');
    this.enterElement.setAttribute('class','level')

    this.label = document.createElement('div');
    this.label.setAttribute('class','level')
    this.label.innerHTML = "Enter a post ID to edit, or pick from a recent one below";
    this.input = document.createElement('input');
    this.input.setAttribute('type','text');
    this.input.setAttribute('class','input');
    this.input.setAttribute('placeholder','7acbd810-39db-11e7-828d-61ad8758da0c');

    this.button = document.createElement('a');
    this.button.setAttribute('class','button is-primary');
    this.button.innerHTML = "Edit";
    this.button.addEventListener('click',e=>{
      window.location = '/admin/#post/edit?id='+self.input.value;
    })

    this.viewButton = document.createElement('a');
    this.viewButton.setAttribute('class','button');
    this.viewButton.setAttribute('target','_top');

    this.viewButton.innerHTML = "View";
    this.input.addEventListener('change',e=>{
      self.viewButton.href = '/post/'+self.input.value+'.html';
    })

    this.label.appendChild(this.enterElement);

    this.enterElement.appendChild(this.input);
    this.enterElement.appendChild(this.viewButton);
    this.enterElement.appendChild(this.button);
    this.element.appendChild(this.label);

    this.listElement = document.createElement('div');
    this.element.appendChild(this.listElement);

  }

  addId(id){
    var el = document.createElement('div');
    el.classList.add('level')
    el.innerHTML = `<pre>${id}</pre> <a class="button is-default" href="/post/${id}.html">View<a><a class="button is-primary" href="#post/edit?id=${id}">Edit</a>`
    this.listElement.appendChild(el);
  }

  setIds(ids){
    // faster operation, add multiple IDs
    var h = '';

    ids.forEach(id=>{
      h+=`<div class="level"><pre>${id}</pre> <a class="button is-default" href="/post/${id}.html">View<a><a class="button is-primary" href="#post/edit?id=${id}">Edit</a></div>`;
    })
    this.listElement.innerHTML = h;
  }

  clear(){
    this.listElement.innerHTML = "";
  }

  load(){
    var ok = false;
    var self = this;
    fetch('/admin/posts',{credentials:'include'}).then(res=>{
      ok = res.ok;
      if(ok){
        return res.json()
      }else{
        return res.text();
      }
    }).then(data=>{
      if (ok){
        self.setIds(data);
      }else{
        popup(data,'danger','Error fetching posts:')
      }
    })
  }

}

module.exports = PostList
