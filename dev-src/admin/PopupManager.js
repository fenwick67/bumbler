
// popups
module.exports = class PopupManager {
  constructor(selector){
    if (typeof selector == 'string'){
      this.el = document.querySelector(selector);
    }else{
      // passed an element
      this.el = selector;
    }
  }
  show(message,type,headerText){
    var type = type||'primary';
    var popup = document.createElement('article');
    popup.setAttribute('class','fadein popup message is-'+type);
    // header
    var header = document.createElement('div');
    header.setAttribute('class','message-header');
    if (headerText){
      header.innerHTML = headerText;
    }
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
