import Vue from 'vue'

module.exports = function() {

  var pm = new Vue({
    methods:{
      show:function(message,type,headerText){
        this.$snackbar.open({
            duration: 5000,
            indefinite:type=='danger',
            message: message,
            type: 'is-'+(type||'default'),
            position: 'is-bottom-right',
            actionText: 'OK',
            queue: false
        })
      }
    }
  })

  return pm;
}
