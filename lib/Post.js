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
var uuid = require('uuid/v1');
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

Post.prototype.requiredKeys = function(json){
  var requiredKeys = ['id','type'];

  if ( json.type == 'audio' || json.type == 'video' || json.type == 'image' ){
    requiredKeys.push('assets');
  }

  // text posts require a title and content
  if (json.type == 'text'){
    requiredKeys.push('caption');
    requiredKeys.push('title');
  }

  if (json.type == 'link'){
    requiredKeys.push('link');
  }

  return requiredKeys;

}


Post.prototype.validate = function validate(json){
  if (!json.type){
    return 'Posts require a type';
  }
  // check it's a valid type
  var types = ['text', 'link', 'audio', 'video', 'image'];
  var ok = false;
  for (var i = 0; i < types.length; i ++){
    if (json.type == types[i]){
      ok=true;
      break;
    }
  }
  if (!ok){
    return 'Bad post type: '+json.type;
  }

  // check it has the needed keys
  var requiredKeys = Post.prototype.requiredKeys(json);
  for (var i = 0; i < requiredKeys.length; i ++){
    if ( !json[requiredKeys[i]] ){
      return 'This post type requires a '+requiredKeys[i];
    }
  }

  if (requiredKeys.indexOf('assets') > -1 && json.assets.length < 1){
    return "This post type requires at least one asset"
  }

  return false;

}

Post.prototype.uuid = uuid;

module.exports = Post;
