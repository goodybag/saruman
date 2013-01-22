define(function(require){
  var
    Backbone  = require('backbone')
  , pubsub    = require('./pubsub')
  , channels  = require('./channels')
  ;

  return Backbone.Router.extend({
    routes: {
      '':                       'index'

    , 'dashboard':              'dashboard'
    , 'businesses':             'businesses'
    , 'businesses/page/:page':  'businessesPaginate'
    , 'businesses/:id':         'businessEdit'

    , 'login':                  'login'
    , 'logout':                 'logout'
    }

  , index: function(){
      Backbone.history.navigate('dashboard', { trigger: true });
    }

  , dashboard: function(){
      pubsub.publish(channels.changePage.dashboard);
    }

  , businesses: function(){
      Backbone.history.navigate('businesses/page/1', { trigger: true });
    }

  , businessesPaginate: function(page){
      pubsub.publish(channels.changePage.businesses, { page: parseInt(page) || 0 });
      pubsub.publish(channels.businesses.pagination, parseInt(page) || 0);
    }

  , businessEdit: function(id){
      pubsub.publish(channels.changePage.businessEdit, { id: id });
      pubsub.publish(channels.businesses.edit, parseInt(id));
    }

  , login: function(){
      pubsub.publish(channels.changePage.login);
    }

  , logout: function(){
      pubsub.publish(channels.logout)
    }
  });
});