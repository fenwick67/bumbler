# Bumbler

<div style="text-align:center">
  <img src="./doc/bumbler-text.png"></img>
</div>
<br>

A straightforward, DIY CMS for photos, images, statuses, audio, blog posts or whatever.  It's optimized for microblogging, but can be used for macroblogging as well.

## Features

* Your site your rules.  No censorship, plus simple yet powerful theming
* Host your files in their original size and format
* Two ways to publish:
  1. Self-host and instantly publish from anywhere, anytime
  2. Builds out to static files, so you can easily write locally and push to github-pages, Neocities, or any other system

## Installation

step 0: install Node.js v7+ and NPM, and open a terminal.

1. `npm install -g bumbler`
2. Create a new folder for your project
3. `cd` into your new site folder
4. Run `bumbler init` inside it and answer the questions
5. Run `bumbler hash` to set your password
  - **DO NOT** re-use a password for this.  Seriously.  This software is pre-alpha and there are probably security holes.
6. Set the hash as the environment variable `BUMBLERHASH`, or (less ideally) save the hash as `.bumblerhash` in your site folder
7. Run `bumbler` and then visit the URL to create posts.

# Publishing

## Self-Hosting

If you have an extra $7/month, you can host it on DigitalOcean ($5), with backups ($1), and get a domain ($1).  Here are some tips:

* Bumbler will **not** work on Heroku or other SAAS platforms with an ephemeral filesystem, because of Bumbler's filesystem-based nature.  All of your files and settings will get blown away every 24 hours or so.
* Install nodejs v7 using the instructions here:  https://github.com/nodesource/distributions#deb
* When running `npm install`, use the `--production` flag to reduce the dependencies and install time
* Use HTTPS.  You can sign up for CloudFlare's free plan, which includes free auto-renewing certificates.
* You can use PM2 to easily manage app startup and shutdown
  - use `pm2 startup` to install startup scripts
  - use only one process (because of in-memory session storage)
  - use `pm2 save` to save your running process
* Set up backups in case your site explodes, or hackers get in and ruin everything.

## Static Hosting

Bumblr was *made to work **with or without** a serverside application*.  You can simply move your project files over to a HTTP server and everything will just work.  Everything except the admin interface is built out to static files.  

The only caveat here is that right now it needs to be the root of the domain.  So you will need to set it up at yoursite.com/ or subdomain.othersite.com/

## TODO items:

### High priority

* let user delete posts
  - [x] API
  - [ ] UI

* let user edit posts
  - [x] API
  - [ ] UI

### Medium priority

* follow other users' RSS feeds
* repost
  - webmention them
  - create post
    + include their content (from h-card or atom feed)
    + be sure to have a different schema and/or template.

### Low priority

plugin system
