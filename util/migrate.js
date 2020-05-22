// this will migrate an old site to a new one (json -> markdown)

const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const globby = require('globby')

globby.sync(['./_bumblersrc/posts/*.json', './_bumblersrc/pages/*.json']).forEach(postFilename=>{
    var newFilename = path.join(postFilename, '../', path.parse(postFilename).name+'.md')
    var frontMatterData = JSON.parse(fs.readFileSync(postFilename));
    var caption = frontMatterData.caption || frontMatterData.content;
    delete frontMatterData.caption
    delete frontMatterData.content
    var md = matter.stringify(caption, frontMatterData);
    fs.writeFileSync(newFilename, md);
});