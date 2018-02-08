/*

RPC wrapper for anything you can do with the admin interface

const api = require('./rpc').api;

api.getPosts(function(er,posts){
  console.log(posts);
})

*/

const url = '/admin/rpc';

exports.api = new Proxy({},{
  get:function(target,name,receiver){
    return function(){

      var callback = function(){};
      if (arguments.length > 0){
        callback = arguments[arguments.length - 1];
      }

      var params = [];
      for (var i = 0; i < arguments.length-1;i++){
        params.push(parameters[i]);
      }
      var body = {
        method:name,
        parameters:params
      };

      var fn = name;
      var ok = false;
      var er = null;
      var resData = null;

      fetch(url,{
        method:"POST",
        credentials:"include",
        headers:{'Content-Type': 'application/json'},
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
  }
})
