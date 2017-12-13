// publish to git repository
var spawn = require('child_process').spawn;
var cwd = process.cwd();
var chalk = require('chalk');
chalk.enabled = true;

// check if exists, create if not exists, set remote, commit, then push
exports.publish = function publish(cb){
  exports.commit(er=>{
    if(er){return cb(er)}
    exports.push(cb);
  });
}

exports.commit = function commit(cb){
  var add = spawn('git',['add','-A'],{cwd})
  logProcess(add);

  add.on('close',code=>{
    if (code){
      return cb(new Error('git add exited nonzero'));
    }
    var commit = spawn('git',['commit','-m','commit from Bumbler'],{cwd})
    logProcess(commit);
    commit.on('close',code=>{
      if(code){
        return cb(new Error('git commit exited nonzero'));
      }
      return cb(null);
    })
  });

}

exports.push = function push(branch,cb){
  var branch = branch;
  var cb = cb;
  if(!cb){
    cb = branch;
    branch = 'master';
  }

  var push = spawn('git',['push','bumbler',branch],{cwd});
  logProcess(push);

  push.on('close',code=>{
    if(code){
      return cb(new Error('git push exited nonzero status'))
    }
    return cb(null)
  });
}

exports.addRemote = function addRemote(url,cb){
  var remote = spawn('git',['remote','add','bumbler',url],{cwd});
  logProcess(remote);
  remote.on('close',code=>{
    if (code){
      return cb(new Error("'git remote add' exited nonzero status"))
    }
    return cb(null);
  });

}

exports.setRemote = function setRemote(url,cb){
  var remote = spawn('git',['remote','set-url','bumbler',url],{cwd});
  logProcess(remote);
  remote.on('close',code=>{
    if (code){
      return cb(new Error("'git remote add' exited nonzero status"))
    }
    return cb(null);
  });

}

exports.init = function init(cb){
  var init = spawn('git',['init'],{cwd});
  logProcess(init);
  init.on('close',code=>{
    if (code){
      return cb(new Error('git init exited nonzero status'))
    }
    return cb(null);
  });
}

exports.check = function check(cb){
  var status = spawn('git',['status'],{cwd});
  logProcess(status);
  status.on('close',code=>{
    if (code){
      return cb(new Error('git status exited nonzero status'))
    }
    return cb(null);
  });
}

exports.ensureExists = function(cb){
  exports.check(function(er){
    if (!er){
      // git repo exists
      return cb(null);
    }else{// git repo no exist, init it
      exports.init(cb)
    }
  })
}

function logProcess(p){
  p.stdout.on('data',d=>{
    process.stdout.write(chalk.green(d));
  });
  p.stderr.on('data',d=>{
    process.stdout.write(chalk.red(d));
  });
}
