// nginx cli option
var DiskController = require('../lib/DiskController');
var fs = require('fs');
var path = require('path');
var chalk = require('chalk');
chalk.enabled = true;

module.exports = (done)=>{

  var settingsController = new DiskController({path:path.join(process.cwd(),'_bumblersrc','bumbler.json')});
  settingsController.load(er=>{
    if (er){return done(er);}

    var settings = settingsController.get();

    var nginx = `
# Default Bumbler nginx config
# do note that this assumes your app is on port 3000.

# place in /etc/nginx/sites-available/my-server and
# put a symlink in /etc/nginx/sites-enabled to make NGINX work.

server {
    listen 80;
    server_name ${'*.'+ settings.siteUrl.replace(/.+?(\/\/)(.+?\.)?/,'').slice(0,-1)};

    root ${process.cwd()};

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
    }

    # deny dotfiles and _bumblersrc

    location ~ /\\. {
        deny all;
    }

    location /_bumblersrc/ {
      deny all;
    }

    # the following are passed off to NGINX to serve from files

    location /index.html {
    }

    location /atom.xml {
    }

    location /page/ {
    }

    location /assets/ {
    }

    location /post/ {
    }

}
    `
    fs.writeFileSync('./bumbler-nginx',nginx,'utf8');
    console.log('wrote "bumbler-nginx" NGINX config file. ')
    console.log('copy it to '+chalk.cyan('/etc/nginx/sites-available/bumbler-nginx')+' and put a symlink in '+chalk.cyan('/etc/nginx/sites-enabled')+' to make NGINX work.')
    return done(null);
  })

}
