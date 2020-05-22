/*
take a post and hydrate it

*/

var marked = require('marked');
var mime = require('mime-types');
var plugins = require('./plugins');
var parseFrontMatter = require("yaml-front-matter").loadFront;

marked.setOptions({
  renderer: new marked.Renderer(),
  gfm: true,
  tables: true,
  breaks: true,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
});

module.exports = function(j){

  j.permalink = '/post/'+j.id+'.html';

  // split tags by commas
  if (j.tags && typeof j.tags == 'string'){
    j.tags = j.tags.split(/,\s*/g);
  }else if (!j.tags){
    j.tags = [];
  }

  j.assets = j.assets || [];
  // create widgets for assets
  j.assets.forEach(asset=>{
    var type = asset.type;
    if (type == 'image'){
      asset.widget = `<img class="asset" src="${asset.href}"></img>`
    }else if (type == 'audio'){
      asset.widget = `<audio class="asset" controls src="${asset.href}"></audio>`
    }else if (type = "video"){
      asset.widget = `<video class="asset" controls src="${asset.href}"></video>`
    }else{
      asset.widget = `<span class="asset" Link to attachment: <a href="${asset.href}">${asset.href}</a></span>`
    }

    // add mimetype
    asset.mimetype = mime.lookup(asset.href) || 'application/octet-stream';

    // check to see if asset is already inline in the post body
    if (j.caption.indexOf(asset.href) > -1){
      asset.inline = true;
    }else{
      asset.inline = false;
    }
  });

  j.englishDate = isoDateToEnglish(j.date);


  var sourceData = j.caption || '';
  // now remove front matter if there is any
  try{
    var frontMatter = parseFrontMatter(sourceData);
    var postMarkdown = frontMatter.__content || '';
  }catch(e){
    console.warn('error parsing front matter:');
    console.warn(e,e.trace)
    var frontMatter = {};
    var postMarkdown = sourceData;
  }
  delete frontMatter.__content;

  j.markdown = postMarkdown;
  j.frontMatter = frontMatter;
  j.caption = marked(postMarkdown);

  // alias the html data
  j.rawHtml = j.caption;
  j.content = j.caption;

  return j;

}

function isoDateToEnglish(d){
  var d = d;
  if (typeof d != 'string'){
    d = d.toISOString();
  }

  var dt = d.split(/[t\-]/ig);
  var months = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

  return months[Number(dt[1])-1] +' '+dt[2]+ ', '+dt[0];
}
