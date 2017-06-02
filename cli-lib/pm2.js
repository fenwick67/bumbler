// create pm2 yaml file

var fs = require('fs');

module.exports = function(){
  var yml =
`
apps:
  - script: bumbler
    instances: 1
    exec_mode: cluster
    env:
      PORT: 8000
`

  fs.writeFileSync('./process.yml',yml,'utf8')
  console.log('Wrote a process.yml for use with PM2.')
  return;
}
