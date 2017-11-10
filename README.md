# Bumbler

<p align="center">
  <img src="https://github.com/fenwick67/bumbler/raw/master/doc/bumbler-text.png"></img>
</p>

A straightforward, file-based CMS and build system for photos, art, statuses, audio, blog posts or whatever.  It's optimized for microblogging, but can be used for regular blogging too.

Look at the example deployment [here](https://bumblerexample.pw/), and check out some example themes [here](http://fenwick67.github.io/bumbler-themes).

## Features

* Static files for ＭＡＸＳＰＥＥＤ, easy migration, and easy administration
* Built-in support for
  * tags
  * arbitrary custom page creation
  * arbitrary static file linking
  * zero configuration Atom feed
  * [Awesome, easy theming](http://fenwick67.github.io/bumbler-themes)
  * favicon generation
  * more to come
* Two ways to publish:
  1. Self-host and instantly publish from anywhere, anytime
  2. Write locally and push to github-pages, Neocities, or any other system

Along with all of the other features the indie web has to offer.

## Installation

step 0: install Node.js v7+ and NPM, and open a terminal.

1. `npm install -g bumbler`
2. Create a new folder for your site
3. `cd` into your new site folder
4. Run `bumbler init` inside it and follow the directions
  - **DO NOT** re-use a password for the admin interface.  Seriously.  This software is pre-alpha and there are probably security holes.

## Directories

Bumbler creates a folder called `_bumblersrc`, which is where all of your site data is stored before building.  Here's the directory structure:

```bash
_bumblersrc/
  ║
  ║  # Things you should modify manually:
  ║  #┌────────────────────┴────────────────────────┐   
  ╠═static/       # Put static files here           │
  ╠═favicon.png   # Put an icon for your site here  │
  ║  #└─────────────────────────────────────────────┘
  ║
  ║  # Things you should just use the UI for:
  ║  # ┌───────────────────┴────────────────────────┐
  ╠═bumbler.json  # site settings                   │
  ╠═posts/        # Your post data lives here       │
  ╠═pages/        # custom pages                    │
  ╚═assets/       # file uploads go here            │
     # └────────────────────────────────────────────┘
```

## Windows

Bumbler works on Windows, with one caveat.

On Windows, you need administrator access to create symbolic links, which Bumbler will do.

# Publishing

## Self-Hosting

If you have an extra $7/month, you can host it on DigitalOcean ($5), with backups ($1), and get a domain ($1).  Here are some tips:

* Bumbler will **not** work on Heroku or other SAAS platforms with an ephemeral filesystem, because of Bumbler's filesystem-based nature.  All of your files and settings will get blown away every 24 hours or so.
* Install nodejs v7 using the instructions here:  https://github.com/nodesource/distributions#deb
* When running `npm install`, use the `--production` flag to reduce the dependencies and install time
* Use HTTPS.  You can sign up for CloudFlare's free plan, which includes free auto-renewing certificates.
* You can use [PM2](http://pm2.keymetrics.io/) to easily manage app startup and shutdown
  - use `pm2 startup` to install startup scripts
  - use only one process (because of in-memory session storage)
  - use `pm2 save` to save your running process
* Set up backups in case your site explodes, or hackers get in and ruin everything.

## Static Hosting

Bumblr was *made to work **with or without** a serverside application*.  You can simply move your project files over to a HTTP server and everything will just work.  Almost everything except the admin interface is built out to static files.  

The only caveat here is that right now it needs to be the root of the domain.  So you will need to set it up at yoursite.com/ or subdomain.othersite.com/

## TODO Items:

### High Priority
* [ ] Save as Draft
* [ ] Create JSON scheme for replying and sharing (reply contexts)
* [ ] Share a url and parse out H-entry and/or opengraph info in the post interface

### Medium Priority

* [ ] Put a RSS feed reader into the admin interface
  - [ ] I can reuse some work from mastofeed for this

### Low Priority

plugin system

## Screenshots

![screenshot](https://github.com/fenwick67/bumbler/raw/master/doc/screenshot.png)
![admin screenshot](https://github.com/fenwick67/bumbler/raw/master/doc/admin-screenshot.png)
