// check and or set password

const bcrypt = require('bcryptjs')
const fs = require('fs');
const path = require('path');
const _ = require('lodash');
const SALT_SIZE = 10;

// load login hash
function loadHash(done){
  var loginHash = _.trim(process.env.BUMBLERHASH || process.env.BUMBLER_HASH);

  if (loginHash){
    return done(null,loginHash);
  }

  fs.readFile(path.join(process.cwd(),'_bumblersrc/.bumblerhash'),'utf8',function (er,hash){
    if(er){
      return done(er);
    }else{
      return done(null,_.trim(hash))
    }
  });

}

exports.genHash = function genHash(password,callback){
  bcrypt.genSalt(SALT_SIZE, function(err, salt) {
    if (err){return callback(err)}
    bcrypt.hash(password, salt, callback);
  });
}


exports.check = function check(password,done){
  loadHash(function(er,hash){
    if(er){
      return done(er);
    }
    return bcrypt.compare(password,hash,done);
  })
}
