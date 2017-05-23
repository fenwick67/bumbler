# bumbler

A DIY barebones CMS for photos, audio, blog posts or whatever.  It's optimized for microblogging, but can be used for macroblogging as well.

Features:

* Builds out to static files, so you can easily write locally and push to github-pages or


## Usage

1. `npm install -g` it
2. create a new folder for your project
3. `cd` into your new site folder
4. run `bumbler init` inside it
5. then, run `bumbler hash` to set your password
  - **DO NOT** re-use a password for this.  Seriously.  This software is pre-alpha and there are probably security holes.
6. save the hash as `.bumblerhash` in your site folder, or set it as `BUMBLERHASH` as an environment variable
7. run `bumbler --open` to view the admin interface for creating posts, reconfiguring, and publishing

# Publishing

## Static Hosting

Bumblr was *made to work without a serverside application*.  You can simply move your project files over to a HTTP server and everything will just work.  Almost everything except the admin interface is built out to static files.  

The only caveat here is that right now it needs to be the root of the domain.  So you will need to set it up at yoursite.com/ or subdomain.othersite.com/

## Self-Hosting

If you have an extra $7/month, you can host it on DigitalOcean ($5), with backups ($1), and get a domain ($1).  Here are some tips:

* Bumbler will **not** work on Heroku or other SAAS platforms with an ephemeral filesystem, because of Bumbler's filesystem-based nature.  All of your files and settings will get blown away every 24 hours or so.
* install nodejs v7 using the instructions here:  https://github.com/nodesource/distributions#deb
* when running `npm install`, use the `--production` flag to reduce the dependencies and install time
* To enable WebFinger support and for better security, use HTTPS.  You can sign up for CloudFlare's free plan, which includes free auto-renewing certificates.
* You can use PM2 to easily manage app startup and shutdown
  - use `pm2 startup` to install startup scripts
  - use only one process (because of in-memory session store)
  - use `pm2 save` to save your running process
* Set up backups in case your site explodes, or hackers get in and ruin everything.


## TODO items:

### High priority

* let user delete posts
  - [x] by ID
  - [ ] with a UI

### Medium priority

* follow other users (hosted only?)
* rebumble
  - webmention them
  - create new post
    + include their content (from h-card or atom feed) but BE SURE TO RE-BUILD THEIR DOM, don't just blindly allow their html. Parse out their img[src], audio[src], a[href], and text.  Might be a bit rough.
    + be sure to have a different schema and/or template.

### Low priority

plugin system
