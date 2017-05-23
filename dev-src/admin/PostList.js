// show a list of posts

class PostList {

  constructor(el){
    this.rows = [];
    this.element = el;
  }

  addId(id){
    var el = document.createElement('div');
    el.classList.add('level')
    el.innerHTML = `<pre>${id}</pre> <a class="button is-default" href="/post/${id}.html">View<a><a class="button is-primary" href="#post/edit?id=${id}">Edit</a>`
    this.element.appendChild(el);
    this.rows.push(el);
  }

  clear(){
    this.rows.forEach(el=>{
      if (el.parentElement){
        el.parentElement.removeChild(el);
      }
    });
    this.rows = [];
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
        var self = this;
        data.forEach(id=>{
          self.addId(id);
        });
      }else{
        popup(data,'danger','Error fetching posts:')
      }
    })
  }

}

module.exports = PostList
