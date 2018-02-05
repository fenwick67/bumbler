# Bumbler

<p align="center">
  <img src="https://github.com/fenwick67/bumbler/raw/master/doc/bumbler-text.png"></img>
</p>

A straightforward, file-based CMS and build system for photos, art, statuses, audio, blog posts or whatever.  It's optimized for microblogging, but can be used for regular blogging too.

Look at the example deployment [here](https://bumblerexample.pw/), and check out some example themes [here](http://fenwick67.github.io/bumbler-themes).


# Screenshots

![admin screenshot](https://github.com/fenwick67/bumbler/raw/master/doc/admin-screenshot.png)

![screenshot](https://github.com/fenwick67/bumbler/raw/master/doc/screenshot.png)

# Features

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

# User guide

## Installation

step 0: install Node.js v7+ and NPM, and open a terminal.

1. `npm install -g bumbler`
2. Create a new folder for your site
3. `cd` into your new site folder
4. Run `bumbler init` inside it and follow the directions
  - **DO NOT** re-use a password for the admin interface.  Seriously.  This software is pre-alpha.

## Directories

Bumbler creates a folder called `_bumblersrc`, which is where all of your site data is stored for building your site.  Here's the directory structure:

```bash
_bumblersrc/
  ║
  ║  # Things you should modify manually:
  ║  #┌────────────────────┴────────────────────────┐   
  ╠═static/       # Put static files here           │
  ╠═favicon.png   # Put an icon for your site here  │
  ╠═plugins/      # plugins go in here              |
  ╠═scripts/      # scripts go in here              |
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

# Publishing Guide

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

# Developer Guide

## Plugins

Bumbler has a plugin system!

Your plugin gets passed two parameters: the plugin library and a ready callback.  

You must call the ready callback with any errors and any hooks you want to handle.  

Here's a simple example with hooks:

```javascript
// _bumblersrc/plugins/last-updated.js

// Put a generationDate value on every page when the site builds

module.exports = function(pluginLib,pluginReady){

  var hooks = {
    beforePageRender:function(oldPage,done){
      var page = JSON.parse(JSON.stringify(oldPage));
      page.generationDate = new Date().toISOString();
      done(null,page);
    }
  };

  // we're ready right away
  pluginReady(null,hooks);
}
```

Here's a more complex example of how you could use Bumbler to publish some other feed's data:

```javascript
// _bumblersrc/plugins/feed-subscriber/index.js

const subscribe = require('theoretical-atom-subscription-library');

module.exports = function(pluginLib,pluginReady){

  subscribe('www.myotherwebsite.com/atomfeed.xml').on('new-post',item=>{
    var postData = {title:item.title,caption:item.caption};
    pluginLib.putPost(postData,(er)=>{      
      pluginLib.buildPages();
    });
  });

  // this plugin uses no hooks
  var hooks = {};

  // we're ready right away
  pluginReady(null,hooks);
}

```

### Available hooks

```
beforePageRender: function(existingPageData,done)
  => you must call done(error,modifiedData)
```

### `pluginLib` methods

```
pluginLib.putPost(postObject,done)
  => add a post, or modify it by its ID.  Use this to create new posts from another source.

pluginLib.buildPages(done)
  => rebuild the site pages if you add a new post, or any other reason.
```
