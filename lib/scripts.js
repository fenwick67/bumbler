// scripts interface
var fs = require('fs-extra');
var path = require('path');
var glob = require('glob');
var util = require('util');
var spawn = require('child_process').spawn;
var exec = require('child_process').exec;

// always ensure scripts dir exists when performing opts

var scriptDir = path.join(process.cwd(),'_bumblersrc/scripts/');

function ensureScriptDirExists(callback){
  fs.ensureDir(scriptDir,callback);
}

exports.list = function(done){
  ensureScriptDirExists(function(er){
    if(er){return done(er);}
    glob(scriptDir+'*',function(er,files){
      if(er){return done(er);}
      return done(null,files.map(f=>{
        return path.parse(f).base;
      }))
    });
  })
}

// done is called with (er, stdout+stderr)
exports.run = function(filename,done){

  var filename = filename;
  filename = filename.replace(/\.\./g,'')

  var std = ''

  ensureScriptDirExists(function(er){

    if(er){
      return done(er,std);
    }

    try{
      var filePath = path.join(scriptDir,filename);
      console.log(filePath);
      exec(filePath,{
        windowsHide:true,
        cwd:process.cwd()
      },function(err, stdout, stderr){
        if (stdout){
          std+= 'STDOUT: \n'+stdout;
        }
        if (stdout && stderr){
          std+='\n--------------'
        }
        if (stderr){
          std+= 'STDERR: \n'+stderr;
        }
        if (!stdout && !stderr){
          std="(no output)";
        }

        return done(err,std);
      });


    }catch(e){
      return done(e,std);
    }

  });

}
