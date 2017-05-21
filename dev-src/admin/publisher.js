// publish to git and show a message

module.exports = function publish(){
  var ok = false;
  fetch('/admin/publish',{method:"POST",credentials: "include"}).then(res=>{
    ok=res.ok;
    return res.text()
  }).then(text=>{
    if (!ok){
      popup(text,'danger','Error publishing:');
    }else{
      popup('publish succeeded!','success')
    }
  }).catch(e=>{
    popup(e,'danger','Error publishing:');
  });
}
