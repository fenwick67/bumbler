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
var ulid = require('ulid');
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

// NOTE TO SELF: this needs to return an array of Strings if there are problems, or return falsy if there are no problems
Post.prototype.validate = function validate(json){
  return false;
}

Post.prototype.uuid = ulid;

module.exports = Post;
