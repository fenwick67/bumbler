// hash CLI command
const passwordManager = require('../lib/password-manager');
const readline = require('readline');
var prompt = require('prompt');
var chalk = require('chalk')

module.exports = function(done){

  var schema = {
  properties:{
    password:
      {
        description: "Enter the password you wish to use to log in",
        pattern: /[\s\S]{7,}/ ,
        message: 'must be 7 or more characters',
        replace: '*',
        required: true,
        hidden:true
      }
  }
}
  prompt.start();
  prompt.get(schema,function(er,result){
    if (er){throw er}
    passwordManager.genHash(result.password,function(er,result){
      if(er){throw er}
      // write it
      console.log('==============================================================\r\n\r\n\r\n')
      console.log(chalk.green(`
IMPORTANT: This is your bcrypt hash.  Set it as ${chalk.bold('BUMBLERHASH')} in your environment,
or save it as ${chalk.bold('.bumblerhash')} in your project directory: `));
      console.log(result);
      console.log('\r\n')
      done(null,result);
    })
  });

}
