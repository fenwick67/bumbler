/*
exports one function, which cleans HTML in a sane+safe way
*/


if (typeof window !== 'undefined'){
  // in browser
  const window = window;
}else{
  // in Node
  const jsdom = require('jsdom');
  const window = jsdom.jsdom('', {
    features: {
      FetchExternalResources: false, // disables resource loading over HTTP / filesystem
      ProcessExternalResources: false // do not execute JS within script blocks
    }
  }).defaultView;
}

const createDOMPurify = require('dompurify');
const DOMPurify = createDOMPurify(window);

module.exports =  DOMPurify.sanitize;
