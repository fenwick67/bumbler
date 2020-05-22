// does what it says on the tin
const matter = require('gray-matter')

module.exports = function markdownToJson(markdownString){
    var o = matter(markdownString);
    var d = o.data;
    d.caption = d.content = d.contents = o.content;
    return d;
}