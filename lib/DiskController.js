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
    this.isString = opts.isString;
    if (this.preload){
      this.load();
    }
  }

  get(callback){
    return this.data;
  }

  // load from disk
  load(callback){
    var callback = callback || function(){};
    fs.readFile(this.path,'utf8',(er,data)=>{
      if (er){
        return callback(er);
      }
      if (!this.isString){
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
        return callback(null,data);
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

  getMiddleware(req,res){
    return res.json(settingsController.get());
  }

  postMiddleware(req,res){
    var data = req.body;
    if (!d){
      res.status(400);
      return res.send('did not include JSON encoded body');
    }
    this.save(data,(er)=>{
      if (er){res.status(500); return res.send(er);}
      this.set(d);
      res.status(200);
      res.send();
    });
  }

}

module.exports = DiskController;
