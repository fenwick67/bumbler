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
var ulid = require('ulid').ulid;
var _ = require('lodash');

// string or date to Date object
function xToDate(x){
  if (typeof x == 'undefined' || x === null){return new Date();}// undefined -> today
  else if (typeof x == 'object') {return x;}// Date already
  else{return new Date(x);} // string or number => use Date constructor
}

// string or Date object to ISOString
function xToDateString(x){
  return xToDate(x).toISOString();
}

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


    if (typeof this.date != "undefined" && this.date != null){
      this.date = xToDateString(this.date);
    }

    if (!this.title){
      this.title = '';
    }
    if (!this.tags){
      this.tags = '';
    }
    if(!this.assets){
      this.assets=[];
    }
    if (!this.id){
      if (this.date){
        this.id=ulid(new Date(this.date).getTime());
      }else{
        this.id = ulid();
      }
    }
    if (!this.permalink){
      this.permalink = '/posts/'+this.id;
    }

    if (!this.date){
      this.date = new Date().toISOString();
    }

  }


}

// NOTE TO SELF: this needs to return an array of Strings if there are problems, or return falsy if there are no problems
Post.prototype.validate = function validate(json){
  return false;
}

Post.prototype.uuid = ulid;

module.exports = Post;
