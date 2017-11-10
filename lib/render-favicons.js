var favicons = require('favicons');
var DiskController = require('./DiskController')
var fs = require('fs-extra');
var path = require('path');
var _ = require('lodash');
var async = require('async');

function renderFavicons(done){
  var settingsController = new DiskController({path:path.join(process.cwd(),'_bumblersrc','bumbler.json')});

  settingsController.load(er=>{
    if (er) {return done(er)};

    // get the favicon file
    fs.readdir(path.join(process.cwd(),'_bumblersrc'),function(er,files){
      if (er){return done(er);}
      // find the file named "favicon"
      var faviconNames = _.filter(files,function(name){
        return name && name.indexOf('favicon') > -1;
      });

      if (faviconNames.length == 0){
        console.log('no favicon found, that\'s okay')
        return done(null);
      }
      var source = path.join(process.cwd(),'_bumblersrc',faviconNames[0]);
      var settings = settingsController.get();

      var configuration = {
        appName: settings.title || null,              // Your application's name. `string`
        appDescription: settings.description || null, // Your application's description. `string`
        developerName: settings.authorName || null,   // Your (or your developer's) name. `string`
        developerURL: settings.siteUrl || null,       // Your (or your developer's) URL. `string`
        background: "#fff",                           // Background colour for flattened icons. `string`
        theme_color: settings.themeColor || null,     // Theme color for browser chrome. `string`
        path: "/",                                    // Path for overriding default icons path. `string`
        display: "browser",                           // Android display: "browser" or "standalone". `string`
        orientation: "portrait",                      // Android orientation: "portrait" or "landscape". `string`
        start_url: "/?homescreen=1",                  // Android start application's URL. `string`
        version: "1.0",                               // Your application's version number. `number`
        logging: false,                               // Print logs to console? `boolean`
        online: false,                                // Use RealFaviconGenerator to create favicons? `boolean`
        preferOnline: false,                          // Use offline generation, if online generation has failed. `boolean`
        icons: {
            // Platform Options:
            // - offset - offset in percentage
            // - shadow - drop shadow for Android icons, available online only
            // - background:
            //   * false - use default
            //   * true - force use default, e.g. set background for Android icons
            //   * color - set background for the specified icons
            //
            android: false,             // Create Android homescreen icon. `boolean` or `{ offset, background, shadow }`
            appleIcon: false,           // Create Apple touch icons. `boolean` or `{ offset, background }`
            appleStartup: false,        // Create Apple startup images. `boolean` or `{ offset, background }`
            coast: false,               // Create Opera Coast icon with offset 25%. `boolean` or `{ offset, background }`
            favicons: true,             // Create regular favicons. `boolean`
            firefox: false,             // Create Firefox OS icons. `boolean` or `{ offset, background }`
            windows: false,             // Create Windows 8 tile icons. `boolean` or `{ background }`
            yandex: false               // Create Yandex browser icon. `boolean` or `{ background }`
        }
      }
      // generate em
      favicons(source,configuration,function(er,stuffs){
        if (er ){ return done(er); }

        var toWrite = _.filter(stuffs.images,function(image){
          return image.name == 'favicon.ico';
        })
        console.log('writing favicon')
        async.each(toWrite,function(image,cb){
          // has name and contents
          fs.writeFile(path.join(process.cwd(),image.name),image.contents,cb)
        },done)

      })

    })
  })
}

module.exports = renderFavicons;

if (process.send){
  renderFavicons(function(er){
    process.send(er,function(messageError){
      if(messageError){procecess.exit(1);}
      process.exit(0);
    });
  })
}
