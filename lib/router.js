define(function(require){
  var
    Backbone  = require('backbone')
  , pubsub    = require('./pubsub')
  ;

  return Backbone.Router.extend({
    routes: {
      '': 'index'
    }

  , index: function(){
      pubsub.publish('change-page', 'index');
    }
  });
});