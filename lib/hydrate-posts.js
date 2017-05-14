// placeholder

// todo: add widgets to each attachment
// todo: permalink '/post/'+post.id
module.exports = function(j){

  console.log(typeof j)
  j.permalink = '/post/'+j.id+'.html';

  // create widgets for assets
  j.assets.forEach(asset=>{
    var type = asset.type;
    if (type == 'image'){
      asset.widget = `<img src="${asset.href}"></img>`
    }else if (type == 'audio'){
      asset.widget = `<audio controls src="${asset.href}"></audio>`
    }else if (type = "video"){
      asset.widget = `<video controls src="${asset.href}"></video>`
    }else{
      asset.widget = `<a href="${asset.href}">Link to attachment: ${asset.href}</a>`
    }
  });

  return j;

}
