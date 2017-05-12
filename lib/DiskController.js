// getter and setter methods from disk

/*
methods:

load(cb)
get()
set(data)
save([data],callback)

*/

var fs = require('fs');
var EventEmitter = require('events');

class DiskController extends EventEmitter{
  constructor(opts){
    super();
    if (!opts.path){
      throw new Error('path is required for DiskController')
    }
    this.path = opts.path.toString();
    this.data = opts.data||{};
    this.preload = opts.preload||false;
    this.isString = opts.isString || opts.isText || false;
    if (this.preload){
      this.load();
    }
  }

  get(callback){
    return this.data;
  }

  // load from disk
  load(callback){
    var self = this;
    var callback = callback || function(){};
    fs.readFile(this.path,'utf8',(er,data)=>{
      if (er){
        return callback(er);
      }
      if (!self.isString){
        try{
          var d = JSON.parse(data);
          this.data = d;
          callback(null,d);
          this.emit('load');
          return;
        }catch(e){
          return callback(e);
        }
      }else{
        self.data = data;
        return callback(null,self.data);
      }
    })
  }

  // save to disk
  save(data,callback){
    var cb;

    // only passed a callback
    if (typeof data == 'function'){
      cb = data;
    }else if (typeof data == 'undefined'){
      // no parameters
      cb = function(){};
    }else{
      // passed data and a callback
      cb = callback;
      this.set(data);
    }

    var toWrite = this.isString?data:JSON.stringify(data,null,2);

    fs.writeFile(this.path,toWrite,'utf8',(er)=>{
      if (er){
        return cb(er);
      }else{
        cb(null);
        this.emit('save');
        return;
      }
    });
  }

  set (d){
    if (typeof d == 'object' && this.isString){
      this.data = d.data;
    }else{
      this.data = d;
    }
  }

  toString(){
    return JSON.stringify(this.data);
  }

  getMiddleware(){
    var self = this;
    return function(req,res){
      if (self.isString){
        return res.send(self.get());
      }else{
        return res.json(self.get());
      }
    }
  }

  postMiddleware(){
    var self = this;
    return function(req,res){
      var data = req.body;
      if (!data){
        res.status(400);
        return res.send('did not include JSON encoded body');
      }
      var d;
      // if it's a string, it shoudl be the "data" key
      if (self.isString){
        d = data.data;
        if (!d){
          res.status(400);
          return res.send('POST body should have a data key in it to save file')
        }
      }else{
        d = data;
      }

      self.save(d,(er)=>{
        if (er){res.status(500); return res.send(er);}
        // save also updated the data key
        res.status(200);
        res.send(self.get());
      });
    }
  }

}

module.exports = DiskController;
