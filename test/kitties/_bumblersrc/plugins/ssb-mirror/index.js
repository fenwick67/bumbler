const party = require('ssb-party')
const path = require('path');
const lastIndexFile = path.join(__dirname,'lastIndex');
const fs = require('fs');
var pull = require('pull-stream')
const util = require('util');
const sanitize = require('sanitize-html');

const drewsId = '@Q4rYvVUlbC0wdOhl0tmisTeJhTR/Y3PIu8yfXiMYXxY=.ed25519'

const inviteCodes = [];

/*
note:

https://staltz.com/open-analytics.html

*/


module.exports = function(pluginLib,ready){

  return ready(null,{});

  // (hissing sounds)
  var lastIndex = Number(fs.readFileSync(lastIndexFile,'utf8'))||0;

  party( (err, sbot)=>{
    if (err){console.log(err);return;}
    console.log(':party:');

    sbot.gossip.peers((er,peers)=>{
      if (er){return console.log(er);}
      var nPeers = peers.filter(p=>!p.error).length;
      console.log(`${nPeers} peers in the network`)
    })

    // connect to stuff when it comes online
    inviteCodes.forEach(code=>{
      sbot.invite.accept(code,er=>{
        if(er){console.log( er ) ;}
        else{console.log('invite accepted to '+code)}
      });
    });

    // https://scuttlebot.io/apis/scuttlebot/ssb.html#createuserstream-source
    var userStream = sbot.createUserStream({ id:drewsId, gt:lastIndex, live:true });

    //read source and log it.
    function streamHandler () {
      return function (read) {
        read(null, function next(end, data) {
          if(end === true) return console.log('done reading user post stream'); // done
          if(end) console.log(end) // error! :o


          if (data.value && data.value.content && data.value.content.type == 'post'){
            console.log('a post!')
            console.log(util.inspect(data))
          }
          // original posts only
          if (
            data.value
            && data.value.content
            && data.value.content.type == "post"
            // && !data.value.content.branch
            // && !data.value.content.root
            && typeof data.timestamp == 'number'
            && typeof data.value.content.text == 'string'
          )
          {
            console.log('this is what I will repost:')
            var post = {
              date:new Date(data.timestamp),
              caption:sanitize(data.value.content.text),
              tags:'scuttlebutt'
            };
            console.log(post);

            pluginLib.putPost(post,function(er){
              // more hissing noises
              fs.writeFileSync(lastIndexFile,lastIndex.toString());
              pluginLib.buildPages();
            });

          }

          if (data.value && data.value.sequence && typeof data.value.sequence == 'number'){
            lastIndex = Math.max(lastIndex,data.value.sequence)
          }

          read(null, next)
        })
      }
    }

    var handle = streamHandler();

    handle(userStream);

  })

  var hooks = {};

  return ready(null,{hooks})

}
