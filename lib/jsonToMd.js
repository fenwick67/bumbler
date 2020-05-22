const matter = require('gray-matter')
const _ = require('lodash')

module.exports = function(json){
    var o = _.cloneDeep(json);
    var content = o.contents || o.content || o.caption;
    delete o.contents;
    delete o.content;
    delete o.caption;
    return matter.stringify(content, o);
}