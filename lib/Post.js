/* post
  each post has the following:

   id
   date
   type (text, link, embed, audio, video, image)
   caption (if not text)
   permalink
   assets (if audio or video or image)
   title (if a link or embed or text)

   ...

   html (generated)
*/
var _ = require('lodash');

class Post{
  constructor(json){
    // jsonize it (remove funcs etc)
    var json = JSON.parse(JSON.stringify(json));

    // validate it
    var problem = Post.prototype.validate(json);
    if (problem){
      throw new TypeError(problem);
    }

    // inherit from json but don't override my methods
    _.defaults(this,json);

    // add permalink
    this.permalink = '/posts/'+this.id;

  }

  // asyncronous render
  render(callback){

  }

}

Post.prototype.requiredKeys = function(type){
  var requiredKeys = ['id','type','caption'];

  if ( json.type == 'link' || json.type == 'text' || json.type == 'embed' ){
    requiredKeys.push('title');
  }else if ( json.type == 'audio' || json.type == 'video' || json.type == 'image' ){
    requiredKeys.push('assets');
  }

  return requiredKeys;

}


Post.prototype.validate = function validate(json){
  if (!json.type){
    return 'post requires a type';
  }
  // check it's a valid type
  var types = ['text', 'link', 'embed', 'audio', 'video', 'image', 'date'];
  var ok = false;
  for (var i = 0; i < types.length; i ++){
    if (json.type == types[i]){
      ok=true;
      break;
    }
  }
  if (!ok){
    return 'bad post type: '+json.type;
  }

  // check it has the needed keys
  var requiredKeys = Post.prototype.requiredKeys(json.type);
  for (var i = 0; i < requiredKeys.length; i ++){
    if (typeof json[requiredKeys[i]] == 'undefined'){
      return 'this post type requires a '+requiredKeys[i];
    }
  }
  return false;

}


module.exports = Post;
