/*

quick method to load settings from browser

*/


var _ = require('lodash');

module.exports = function load(done){
  var ok = false;
  fetch('/admin/settings',{credentials: "include"}).then(res=>{
    ok = res.ok;
    return res.json();
  }).then(json=>{
    return done(null,_.clone(json));
  }).catch(e=>{
    return done(e);
  })

}
