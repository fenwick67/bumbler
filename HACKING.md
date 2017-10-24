# Hacking on Bumbler

## Templates

The following items are exposed to the template:

```javascript
{
  site: {}, // all of the site settings [title, description, pageCount, authorName, metadata, ...] are in here
  pageNumber: Number, // the page that is being visited
  links: {
    nextPage: String, //URL of next page
    previousPage: String, // URL of next page   
    firstPage: String, // URL of first page
    lastPage: String // URL of last page
  },
  tag:String, // if this is a tag page, this will be the name of the current tag.  This will be falsy if not a tag page.
  posts: [// an array of post objects (NOTE: may be empty)
    {
      //todo
      title: String, // optional, the title of the post
      caption: String, // the post's caption / text content.  HTML supported.
      tags: [String,String...], // the tags for the post
      assets:[{
        url:String,
        type:String, // audio, image, ...
        widget: String // HTML that will render the asset.  An <img> tag for images, <audio> tag for audio...
      }]
    }
  ]
}
```

## Exporting

todo

## plugins?

todo
