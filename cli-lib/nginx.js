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

    client_max_body_size 50M;

    error_page  404  /404.html;

    # /admin, /login
    location ~ /admin {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        add_header X-Proxied Yes;
    }

    location ~ /login {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        add_header X-Proxied Yes;
    }

    # deny dotfiles and _bumblersrc

    location ~ /\. {
        deny all;
    }
    location /_bumblersrc/ {
      deny all;
    }


    # cache assets for a while
    location /assets/ {

        access_log off;
        expires 30d;
        ## No need to bleed constant updates. Send the all shebang in one
        ## fell swoop.
        tcp_nodelay off;
        ## Set the OS file cache.
        open_file_cache max=3000 inactive=120s;
        open_file_cache_valid 45s;
        open_file_cache_min_uses 2;
        open_file_cache_errors off;
    }

    # serve the root from files
    location / {
    }


}

`
    fs.writeFileSync('./bumbler-nginx',nginx,'utf8');
    console.log('wrote "bumbler-nginx" NGINX config file. ')
    console.log('copy it to '+chalk.cyan('/etc/nginx/sites-available/bumbler-nginx')+' and put a symlink in '+chalk.cyan('/etc/nginx/sites-enabled')+' to make NGINX work.')
    return done(null);
  })

}
