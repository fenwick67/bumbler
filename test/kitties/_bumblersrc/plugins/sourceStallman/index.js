// more complex example: source an RSS feed and create posts on all new items.

const fs = require('fs');
const FeedMe = require('feedme');
const path = require('path');
const lastData = path.join(__dirname,'lastData');
const stallmanUrl = 'https://stallman.org/rss/rss.xml';
const https = require('https');
const async = require('async');
const sanitize = require('sanitize-html');

// compare feed entries to check for new ones
// only tested on stallman's rss feed!
function serializeFeedEntry(item){
  return item.id || item.guid.text;
}

module.exports = function(pluginLib,ready){

  // we don't use hooks so we can just say we're ready now.
  ready(null,{name:"source-stallman"});

  function check(){
    // first grab the most recent details we have cached
    fs.readFile(lastData,'utf8',function(er,data){

      if (er){console.error(er);return;}

      var oldEntryIds;
      try{
        oldEntryIds = JSON.parse(data);
      }catch(e){
        console.error(e);
        return;
      }

      var parsedEntryIds = [];
      var toCreate = [];

      // grab the feed!
      https.get(stallmanUrl, (res) => {
        if (res.statusCode > 399 || res.statusCode < 200) {
          console.error(new Error(`status code ${res.statusCode}`));
          return;
        }
        const parser = new FeedMe();
        parser.on('item', (item) => {
          var id = serializeFeedEntry(item);
          parsedEntryIds.push(id);

          if (oldEntryIds.indexOf(id) > -1){
            // don't publish this if we've already handled it
            return;
          }
          // create the item
          toCreate.unshift({
            caption:'Stallman Sez: \n\n'+sanitize(item.description.replace(/\n/g,'&nbsp;')),
            title:item.title,
            permalink:item.permalink,
            tags:"stallman",
            date:item.pubdate?new Date(item.pubdate):new Date()
          });

        });

        parser.on('end',function(){
          // save which items we've parsed

          if (toCreate.length < 1){
            console.log("no new items to parse from Stallman\'s feed");
            return;
          }

          // the posts get written to bumbler, via pluginLib
          async.eachSeries(toCreate,pluginLib.putPost,function done(er){
            if (er){console.error(er);return;}

              fs.writeFile(lastData,JSON.stringify(parsedEntryIds),function(er){
                if (er){console.error(er);return;}

              console.log(`published ${toCreate.length} new posts from Stallman :)`)
              pluginLib.buildPages(function(er){
                console.log('rebuilt site for our lord and savior Richard Stallman')
              });
            });
          })
        });

        res.pipe(parser);

      })

    })

  }

  // check every 30 minutes and also right now
  setInterval(check,30*60*60*1000);
  check();

}
