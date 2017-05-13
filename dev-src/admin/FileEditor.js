
// text editor element
module.exports = class FileEditor extends Object{

  constructor(href,element,type,opts){
    super();
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
    var ok = true;
    fetch(this.href,{method: "DELETE"}).then(req=>{
      ok = req.ok;
      return req.text();
    }).then(text=>{
      if (ok){
        window.popup('deleted','success')
      }else{
        window.popup('error: '+text,'danger','Error Deleting')
      }
    }).catch(er=>{
      window.popup('error: '+er,'danger','Error Deleting')
    })
  }

  load(reload){
    // load the data
    var ok = true;
    fetch(this.href).then(req=>{
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
