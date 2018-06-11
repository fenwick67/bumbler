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
  * custom pages
  * static file linking
  * zero configuration Atom feed
  * [Awesome, easy theming](http://fenwick67.github.io/bumbler-themes)
  * favicon generation
  * more to come
* Plugin system in development
* Two ways to publish:
  1. Self-host and instantly publish from anywhere, anytime
  2. Write locally and push to github-pages, Neocities, or any other system

# User guide

## Installation

step 0: install Node.js v7+ and NPM, and open a terminal.

1. `npm install -g bumbler`
2. Create a new folder for your site
3. Go into your new site folder with `cd`
4. Run `bumbler init` and follow the directions
    * On Windows, you need admin access to create symbolic links, which Bumbler will do.  Sorry :(
5. Run `bumbler` to start up your site
6. Navigate to `localhost:3000` in a web browser to see it, and go to `localhost:3000/admin` to start making posts and customizing your site.  The UI should explain itself.

## Directories

Bumbler creates a subfolder called `_bumblersrc`, which is where all of your site data is stored for building your site.  Here's its directory structure:

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

# Publishing Guide

## Self-Hosting

If you have an extra $7/month, you can host it on DigitalOcean ($5), with backups ($1), and get a domain ($1).  Here are some tips:

* Bumbler will **not** work on Heroku or other SAAS platforms with an ephemeral filesystem, because of Bumbler's filesystem-based nature.  All of your files and settings will get blown away every 24 hours or so.
* Install nodejs v7 using the instructions here:  https://github.com/nodesource/distributions#deb
* Use HTTPS
* Set up backups in case your site explodes, or hackers get in and ruin everything.

## Static Hosting

Bumblr builds a static site, which means unlike a conventional CMS, the final site is just a bunch of files.  You can simply move your files over to a HTTP server and everything will just work.

One easy way to make this work is to drop a shell script in `_bumblersrsc/scripts` that pushes your site data out.  Then you can simply run it from the admin interface later.

# Developer Guide

## Developing Plugins

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
  pluginReady(null,{hooks});
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
  pluginReady(null,{hooks});
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

## Developing Bumbler itself

The easiest way to develop is in one terminal run `gulp watch` and in another terminal run `cli.js --dir test/kitties`.

Building is handled by Gulp.  There are a few commands you can run:
* `gulp` builds bumbler for development
* `gulp dist` builds bumbler for distribution / production
* `gulp watch` builds bumbler for development and will build it again whenever files change

This project compiles pug to html, scss to css, and js to js via browserify + babel.  All built source files are located in `dev-src/`
