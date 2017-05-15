// publish to git repository
var spawn = require('child_process').spawn;
var cwd = process.cwd();
var chalk = require('chalk');
chalk.enabled = true;

// commit then push
exports.publish = function publish(cb){
  commit(er=>{
    if(er){return cb(er)}
    push(cb);
  })
}

exports.commit = function commit(cb){
  var add = spawn('git',['add','*'],{cwd})
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

exports.push = function push(cb){
  var push = spawn('git',['push','bumbler','master'],{cwd});
  logProcess(push);

  push.on('close',code=>{
    if(code){
      return cb(new Error('git push exited nonzero status'))
    }
    return cb(null)
  });
}

exports.setRemote = function setRemote(url,cb){
  var remote = spawn('git',['remote','set','bumbler',url],{cwd});
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


function logProcess(p){
  p.stdout.on('data',d=>{
    process.stdout.write(chalk.blue(d));
  });
  p.stderr.on('data',d=>{
    process.stdout.write(chalk.red(d));
  });
}
