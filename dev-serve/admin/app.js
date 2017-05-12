document.addEventListener("DOMContentLoaded", function(event) {

// popups

var popupManager = new PopupManager('#popup-area');
window.popup = popupManager.show.bind(popupManager);

// menu controller and template renderer
// I don't need no stinking MVC framework

var sidebar = document.getElementById('sidebar');
var templates = document.querySelectorAll('hash-template');
var activeSidebarEl = null;
var activeTemplate = null;

var navigateTo = new CustomEvent("navigate-to", { "detail": "navigate to event" });
var navigateAway = new CustomEvent("navigate-away", { "detail": "navigate away event" });

window.addEventListener('hashchange',function(e){
  // load the appropriate template based on window.location.hash
  var page = window.location.hash.replace('#','').replace(/\//g,'-');
  if (page){
    navigate(page);
  }
  return false;
});

function navigate(page){
  var found = false;

  // find matching nav element
  var href = '#'+page.replace(/\-/g,'/')
  var sbEl = sidebar.querySelector('a[href="'+href+'"]');
  if (sbEl){
    if(activeSidebarEl){
      activeSidebarEl.classList.remove('is-active');
    }
    sbEl.classList.add('is-active');
    activeSidebarEl = sbEl;
  }

  for (var i = 0; i < templates.length; i ++){
    var template = templates[i];
    if (template.id === page){
      found = true;
      template.setAttribute('class','unhidden');
      template.dispatchEvent(navigateTo);

      if (activeTemplate && activeTemplate !== template){
        activeTemplate.setAttribute('class','');
        activeTemplate.dispatchEvent(navigateAway);
      }

      activeTemplate = template;
    }
  }
  if (!found){
    navigate('404');
  }
}


// files controller
document.getElementById('files').addEventListener('navigate-to',function(){

  var box = this.querySelector('.file-view');
  box.innerHTML = '';

  fetch('/admin/glob?pattern='+encodeURIComponent('./assets/*')).then(response=>{
    return response.json();
  }).then(json=>{
    console.log(json);
    // add to view
    var view = document.createElement('span');
    json.forEach(function(file){
      var cell = document.createElement('div');
      cell.innerHTML = `<div class="box"><a href="${file}"><img src="${file}"></img>${file}</a></div>`;
      view.appendChild(cell);
    });

    box.appendChild(view);

  });

  // TODO handle file upload
});

// html editor

var htmlEditor = null;
document.getElementById('html').addEventListener('navigate-to',function(){
  if (!htmlEditor){
    htmlEditor = new FileEditor('/admin/html',document.getElementById('htmleditor'),'pug');
  }
  htmlEditor.load();
});

// text editor element
class FileEditor extends Object{

  constructor(href,element,type,opts){
    super();
    this.opts = opts||{};
    this.canDelete = this.opts.canDelete || false;
    this.element = element;
    this.href = href;

    this.deleteButton = document.createElement('button');
    this.deleteButton.setAttribute('class','button is-danger');
    this.deleteButton.innerHTML = "Delete";

    this.saveButton = document.createElement('button');
    this.saveButton.setAttribute('class','button is-primary');
    this.saveButton.innerHTML = "Save";

    this.revertButton = document.createElement('button');
    this.revertButton.setAttribute('class','button is-danger');
    this.revertButton.innerHTML = "Revert Changes";

    this.textarea = document.createElement('textarea');
    this.textarea.name="data";

    this.buttonContainer = document.createElement('div');
    this.buttonContainer.setAttribute('class','field is-grouped')

    element.appendChild(this.textarea);
    this.buttonContainer.appendChild(this.saveButton);
    this.buttonContainer.appendChild(this.revertButton);
    if (this.canDelete){
      this.buttonContainer.appendChild(this.deleteButton);
    }
    element.appendChild(this.buttonContainer);

    var self = this;

    this.deleteButton.addEventListener('click',()=>self.delete());
    this.saveButton.addEventListener('click',()=>self.save());
    this.revertButton.addEventListener('click',()=>self.load())
  }

  save(){
    var contents = this.textarea.value;
    var ok = true;
    fetch(this.href,{
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
        window.popup('saved')
      }else{
        window.popup('Error saving: '+text,'danger')
      }
    }).catch(er=>{
      window.popup('Error saving: '+er,'danger')
    })
  }

  delete(){
    var contents = this.textarea.value;
    var ok = true;
    fetch(this.href,{method: "DELETE"}).then(req=>{
      ok = req.ok;
      return req.text();
    }).then(text=>{
      if (ok){
        window.popup('deleted')
      }else{
        window.popup('Error deleting: '+text,'danger')
      }
    }).catch(er=>{
      window.popup('Error deleting: '+er,'danger')
    })
  }

  load(){
    // load the data
    fetch(this.href).then(req=>{
      return req.text();
    }).then(text=>{
      this.textarea.value = text;
    })
  }

}

// always navigate to a hash on pageload
var page = window.location.hash.replace('#','').replace(/\//g,'-');
navigate(page||'settings');

}); // end DOM loaded

// popups
class PopupManager extends Object{
  constructor(selector){
    super();
    if (typeof selector == 'string'){
      this.el = document.querySelector(selector);
    }else{
      // passed an element
      this.el = selector;
    }
  }
  show(message,type){
    var type = type||'primary';
    var popup = document.createElement('article');
    popup.setAttribute('class','fadein popup message is-'+type);
    // header
    var header = document.createElement('div');
    header.setAttribute('class','message-header');
    var title = document.createElement('p');
    var button = document.createElement('button');
    button.setAttribute('class','delete');
    header.appendChild(title);
    header.appendChild(button);
    popup.appendChild(header);
    // body
    var msgBody = document.createElement('div');
    msgBody.setAttribute('class','message-body');
    msgBody.innerHTML = message;

    popup.appendChild(header);
    popup.appendChild(msgBody);

    var removed = false;
    //delete on click
    function remove(){
      if (removed){return;}
      removed = true;
      popup.parentElement.removeChild(popup);
      button.removeEventListener('click',remove);
    }


    setTimeout(function(){
      popup.classList.add('fadeout');
    },5000)

    setTimeout(remove,6000)

    button.addEventListener('click',remove)

    //add to DOM
    this.el.appendChild(popup);


    setTimeout(function(){
      popup.classList.remove('fadein');
    },100)

  }
}
