define(function(require){
  var
    pubsub    = require('./pubsub')
  , channels  = require('./channels')
  , utils     = require('./utils')
  ;

  return utils.Router.extend({
    routes: {
      '':                                       'index'

    , 'dashboard':                              'dashboard'

    , 'businesses/page/:page':                  'businessesPaginate'
    , 'businesses/:bid':                        'businessDetails'

    , 'businesses/:bid/locations':              'businessLocations'
    , 'businesses/:bid/locations/page/:page':   'businessLocationsPaginate'
    , 'businesses/:bid/locations/create':       'businessLocationsCreate'
    , 'businesses/:bid/locations/:lid':         'businessLocationsEdit'

    , 'businesses/:bid/menu-details':           'businessMenuDetails'
    , 'businesses/:bid/menu-categories':        'businessMenuCategories'

    , 'login':                                  'login'
    , 'logout':                                 'logout'
    }

  , index: function(){
      pubsub.publish(channels.app.changePage.dashboard);
    }

  , dashboard: function(){
      pubsub.publish(channels.app.changePage.dashboard);
    }

  , businessesPaginate: function(page){
      pubsub.publish(channels.app.changePage.businesses, { page: parseInt(page) || 0 });
      pubsub.publish(channels.businesses.pagination, parseInt(page) || 0);
    }

  , businessDetails: function(id){
      pubsub.publish(channels.app.changePage.business, { id: parseInt(id) });
      pubsub.publish(channels.business.changePage.main);
    }

  , businessLocationsPaginate: function(id, page){
      pubsub.publish(channels.app.changePage.business, { id: parseInt(id), page: null, pageNum: page, page: 'locations' });
      pubsub.publish(channels.business.changePage.locations, { pageNum: parseInt(page) });
    }

  , businessLocationsCreate: function(id){
      pubsub.publish(channels.app.changePage.business, { id: parseInt(id), page: 'location' });
      pubsub.publish(channels.business.changePage.location, { create: true });
    }

  , businessLocationsEdit: function(bid, lid){
      pubsub.publish(channels.app.changePage.business, { id: parseInt(bid), page: 'location' });
      pubsub.publish(channels.business.changePage.location, { locationId: parseInt(lid) });
    }

  , businessMenuDetails: function(bid){
      pubsub.publish(channels.app.changePage.business, { id: parseInt(bid), page: 'menu-details' });
      pubsub.publish(channels.business.changePage.menuDetails);
    }

  , businessMenuCategories: function(bid){
      window.location.href = window.location.origin + "/menu-categories/?businessId=" + bid;
    }

  , login: function(){
      pubsub.publish(channels.app.changePage.login);
    }

  , logout: function(){
      pubsub.publish(channels.logout)
    }
  });
});