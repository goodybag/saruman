define(function(require){
  var
    Backbone  = require('backbone')
  , pubsub    = require('./pubsub')
  , channels  = require('./channels')
  ;

  return Backbone.Router.extend({
    routes: {
      '':                                       'index'

    , 'dashboard':                              'dashboard'
    , 'businesses':                             'businesses'
    , 'businesses/page/:page':                  'businessesPaginate'
    , 'businesses/:bid':                        'businessDetails'
    , 'businesses/:bid/locations':              'businessLocations'

    , 'login':                                  'login'
    , 'logout':                                 'logout'
    }

  , index: function(){
      Backbone.history.navigate('dashboard', { trigger: true });
    }

  , dashboard: function(){
      pubsub.publish(channels.app.changePage.dashboard);
    }

  , businesses: function(){
      Backbone.history.navigate('businesses/page/1', { trigger: true });
    }

  , businessesPaginate: function(page){
      pubsub.publish(channels.app.changePage.businesses, { page: parseInt(page) || 0 });
      pubsub.publish(channels.businesses.pagination, parseInt(page) || 0);
    }

  , businessDetails: function(id){
      pubsub.publish(channels.app.changePage.business, { id: parseInt(id) });
      pubsub.publish(channels.business.changePage.main);
    }

  , businessLocations: function(id){
      pubsub.publish(channels.app.changePage.business, { id: parseInt(id) });
      pubsub.publish(channels.business.changePage.locations);
    }

  , login: function(){
      pubsub.publish(channels.app.changePage.login);
    }

  , logout: function(){
      pubsub.publish(channels.logout)
    }
  });
});