// hash CLI command
const passwordManager = require('./password-manager');
const readline = require('readline');
var prompt = require('prompt');
var chalk = require('chalk')

module.exports = function(){

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
      console.log(`
here is your bcrypt hash.  Please save it as ${chalk.bold('.bumblrhash')} in your project directory
or set it as ${chalk.bold('BUMBLRHASH')} in your environment:
        `)
      console.log(result);
      process.exit(0);
    })
  });



}
