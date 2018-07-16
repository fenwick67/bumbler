# Bumbler

<p align="center">
  <img src="https://github.com/fenwick67/bumbler/raw/master/doc/bumbler-text.png"></img>
</p>

A straightforward, file-based CMS, optimized for chronological content like podcasts, blogging, comics etc. Currently in alpha state, but I use it for my homepage [fenwick.pizza](https://fenwick.pizza).

Look at the example deployment [here](https://bumblerexample.pw/), and check out some example themes [here](http://fenwick67.github.io/bumbler-themes).

# Philosophy

Bumbler tries to take the ease-of-use of a CMS and combines it with the performance and elegance of a static site generator.

Historically CMSes are easy for users to use, but complex. This complexity can lead to performance issues, security problems, and maintenance headaches. Static site generators are powerful, and performant at runtime, but you have to be a developer to use them, and require a lot of "fiddling". Maintaining your own front matter boilerplate scheme, worrying about files being referenced correctly, and generating an atom feed can be a pain.

# Screenshots

![admin screenshot](https://github.com/fenwick67/bumbler/raw/master/doc/admin-screenshot.png)

![screenshot](https://github.com/fenwick67/bumbler/raw/master/doc/screenshot.png)

# Features

* Builds to static files for ＭＡＸＳＰＥＥＤ, portability, and easy administration
* No arcane front-matter magic, directory structure, or commandline wizardry required
* Batteries included. Includes support for
  * tags
  * custom pages
  * post attachments and featured images
  * static file linking
  * zero configuration Atom feed
  * [easy theming](http://fenwick67.github.io/bumbler-themes)
  * favicon generation
* Two ways to publish:
  1. Self-host and instantly publish from anywhere, anytime
  2. Write locally and push to github-pages, Neocities, or any other system

## Non-Features

These are things that Bumbler *intentionally lacks* and will likely **never** support:

* compiling stylesheets for you
* multi-user login
* nested page templates
* in-page editing tools
* built-in social features (comments etc)
* built-in analytics
* file conversion (video transcoding, image resizing etc. Favicons are an exception because they're a huge pain.)
* built-in search

# User guide

## Installation

step 0: install Node.js and NPM

1. Create a new folder for your site and open a terminal inside it
2. `npm install -g bumbler`
3. Run `bumbler init` and follow the directions
    * On Windows, you need admin access to create symbolic links, which Bumbler will do, so you'll have to run the terminal as an administrator. I'm sorry.
4. Run `bumbler` to start up your site
5. Go to `localhost:3000/admin` to start making posts and customizing your site.

&hellip;

6. Try running bumbler --help to see other options, like changing the port. Bumbler comes with some utility commands for generating an nginx config etc.

## Directories


```bash
assets/        # a symlink to ./_bumblersrc/assets, where uploads go
atom/          # your atom feed and its paginated pages will go here
page/          # your site's paginated pages get built to here
post/          # each post gets its own page in here
tag/           # each tag gets an index and paginated pages in here
index.html
favicon.ico
_bumblersrc/   # where the site source data is held
  ║
  ║  #     Things the UI will manage for you:
  ║  # ┌───────────────────┴──────────────────┐
  ╠═bumbler.json  # site settings             │
  ╠═posts/        # Your post data lives here │
  ╠═pages/        # custom pages              │
  ╠═assets/       # file uploads go here      │
  ╠═layout.pug    # the site template         |
  ║  # └──────────────────────────────────────┘
  ║   
  ║  #         Modify these manually if you want:
  ║  # ┌─────────────────────┴────────────────────────────────────────────────┐
  ╠═static/      # files & directories here will be mirrored to the site root │
  ╠═favicon.png  # Put an icon here and favicon.ico will be built             |
  ╠═plugins/     # plugins go in here                                         |
  ╚═scripts/     # you can put executable scripts in here and bumbler will    |
                 #                          let you run them from the UI      |
     # └──────────────────────────────────────────────────────────────────────┘
```

# Publishing Guide

## Self-Hosting

If you have an extra $7/month, you can host it on DigitalOcean ($5), with backups ($1), and get a domain ($1).  Here are some tips:

* Bumbler will **not** work on Heroku or other SAAS platforms with an ephemeral filesystem, because of Bumbler's filesystem-based nature.  All of your files and settings will get blown away every 24 hours or so.
* Install a newer nodejs version using the instructions here:  https://github.com/nodesource/distributions#deb
* Use HTTPS
* Set up backups in case your site explodes, or hackers get in and ruin everything.

## Static Hosting

Since the site builds to static files, you can easily build your site on your PC, then drop the files on a static host using SSH or SFTP. I use github pages for [fenwick.pizza](https://fenwick.pizza). One caveat is that bumbler relies on symlinks, so make sure your host supports those.

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

## Theming Guide

Each page gets the following passed to the template:

```js
{
  _:"the Lodash library",
  linkTo:function(){},
  site:{
    authorName:"Your Name",
    title:"Site Title",
    description: 'Site Description goes here.',
    avatar: '../../your/avatar.png',
    pageCount:10, // total number of pages (if this is a tag page, this will be set to the number of pages for this tag)
    postsPerPage:10, // as configured in settings
    tags:[ // all tags used on the site
      {name:"apples",count:25},
      {name:"pears",count:14},
      {name:"peaches",count:5}
    ]
  },
  page:{
    number:1|2|3|...|null,
    tag:null|'this',
    isCustom:true|false,
    isIndex:true|false,
    customPage:null|{
      title:"Custom",
      content:"<p>This is some custom content</p>"
    },
    links:null|{
      nextPage:URL|null,
      previousPage:URL|null,
      firstPage:URL|null,
      lastPage:URL|null
    },
    posts:null|[
      {
        id:"ABCDEFG",
        caption:'<p>testing my new camera</p>',
        tags:['apples','pears'],
        permalink:"/posts/ABCDEFG.html",
        date:new Date('October 30, 2017'),
        englishDate:'October 30, 2017',
        title:'fruit photos',
        assets:[
          {
            href:'/assets/photo.jpeg'
            widget:'<img src="/assets/photo.jpeg"></img>',
            type:'image'|'video'|'audio'|'unknown',
            featured:true|false,
            inine:true|false // whether the asset was included in post caption
          },
          '...'
        ],

      },
      '...'
    ]
  }  
}
```

`linkTo` is a utility function that will give you links to the various URLs of the site. These are the valid uses of the linkTo function:

```js
linkTo('feed')// the atom feed
linkTo('page',3)// third page of the whole site
linkTo('tag','apples')// apples tag
linkTo('tag','apples',2)// second page of the apples tag
linkTo('root')
linkTo('admin')// admin login page
```

_ is Lodash.


The **landing page** will have `page.isIndex == true`.

**Custom pages** have `page.isCustom === true` and a `page.customPage` object.

**Individual post pages** have `!page.number`, `page.posts` and `page.posts.length === 1`.

**Pages with multiple posts** have a `page.number`, 0 or more `page.posts`, and some `page.links`.

**Tag pages** have a `page.tag` and a `page.number`.

### Basic Theme

The most barebones, functional theme will look like this. Notice how you need to parse the `page` and `site` objects defensively:

```pug
html
  head
    title= site.title
    link(type="application/atom+xml", rel="alternate", href=linkTo("feed"))
    meta(name="description" content=site.description)
    meta(charset="utf-8")
  body

    if page.isCustom
      h1= page.customPage.title
      div!= page.customPage.content

    if page.posts
      each post in page.posts
        hr
        h1= post.title
        div Posted in these tags:
          if post.tags
            each tagName in post.tags
              a(href=linkTo('tag',tagName))= tagName
        each asset in post.assets
          div!= asset.widget
        div!= post.caption

    hr

    if page.links
      if page.links.previousPage
        a(href=page.links.previousPage) view previous page
      if page.links.nextPage
        a(href=page.links.nextPage) view next page

    div Copyright #{new Date().getFullYear()} #{site.authorName}

```
