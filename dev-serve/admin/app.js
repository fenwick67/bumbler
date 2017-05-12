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

// always navigate to a hash on pageload
var page = window.location.hash.replace('#','').replace(/\//g,'-');
navigate(page||'settings');
