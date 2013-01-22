define(function(require){
  var
    Backbone  = require('backbone')
  , pubsub    = require('./pubsub')
  ;

  return Backbone.Router.extend({
    routes: {
      '':           'index'
    , 'dashboard':  'dashboard'
    }

  , index: function(){
      pubsub.publish('change-page', 'index');
    }

  , dashboard: function(){
      pubsub.publish('change-page', 'dashboard');
    }
  });
});