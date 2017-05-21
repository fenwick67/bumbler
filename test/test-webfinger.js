// or just use http://silverbucket.github.io/webfinger.js/demo/

var WebFinger = require('webfinger.js');

var webfinger = new WebFinger({
  webfist_fallback: false,  // defaults to false
  tls_only: true,          // defaults to true
  uri_fallback: false,     // defaults to false
  request_timeout: 10000,  // defaults to 10000
});

webfinger.lookup('drew@bumblerexample.pw', function (err, p) {
  if (err) {
    return console.log('error: ', err.message);
  } else {
    return console.log('got response: ',p);
  }
});
