// NOTE this isn'tcompiled, it's raw

document.addEventListener('DOMContentLoaded',function(ev){

  checkLogin(er=>{
    if(!er){
      //we're logged in already!
      window.location.href='/admin/'
    }
  })

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

  function checkLogin(callback){
    // check whether we are logged in
    // make a request to the 'echo' rpc call and see if we get a 200
    var jwt = localStorage.getItem('jwt');
    var body = {
      method:'echo',
      parameters:[],
      token:jwt
    };

    var ok = false;
    var er = null;
    var resData = null;

    fetch('/admin/rpc',{
      method:"POST",
      headers:{
        'Content-Type': 'application/json',
        "Authorization":"Bearer "+jwt
      },
      body:JSON.stringify(body)
    }).then(res=>{
      ok = res.ok;
      if(ok){
        return res.json();
      }else{
        return res.text();
      }
    }).then(data=>{
      if (ok){
        resData = data;
      }else{
        er = new Error('Bad response from API: \n'+data);
      }
    }).catch(netError=>{
      er = netError;
    }).finally(l=>{
      callback(er,resData);
    });
  }

});
