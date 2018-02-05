/*

This plugin simply sets the site.lastUpdated key in the template with the current date.

*/
module.exports = function(pluginLib,ready){


  var hooks = {
    beforePageRender:  function (oldData,done){
      // create a copy of the data
      var newData = JSON.parse(JSON.stringify(oldData));

      // set the lastUpdated key
      if (newData.site){
        var stringDate = new Date().toString();
        newData.site.lastUpdated = newData.site.lastUpdated||stringDate;
      }

      // call asynchronously as good practice
      return done(null,newData);

    }
  }
  
  // we don't do any IO so we're actually ready now
  return ready(null,{name:"last-updated",hooks:hooks});

}
