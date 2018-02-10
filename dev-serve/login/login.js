// NOTE this isn'tcompiled, it's raw

document.addEventListener('DOMContentLoaded',function(ev){
  var $ = function(s){return document.getElementById(s)};

  var un = $('username');
  var pass = $('password');
  var form = $('form');

  form.addEventListener('submit',tryLogin,false);

  function tryLogin(e){
    e.preventDefault();
    var ok = false;
    var body = {
      username:un.value,
      password:pass.value
    }

    fetch('/login',{
      method:"POST",
      headers:{'Content-Type': 'application/json'},
      body:JSON.stringify(body)
    }).then(function(response){
      ok = response.ok
      if(ok){
        return response.json()
      }else{
        return response.text();
      }
    }).then(function(result){
      if (ok){
        localStorage.setItem('jwt',result.token);
        console.log(result.token);
        // new we go to /admin and we're done
        window.location.href='../admin';
      }else{
        throw new Error(result);
      }
    }).catch(function(e){
      alert(e);
    })

  }

});
