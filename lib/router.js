define(function(require){
  var
    utils     = require('./utils')
  , config    = require('../config')
  , api       = require('./api')
  , troller   = require('./troller')
  ;

  return utils.Router.extend({
    routes: {
      '':                                       'index'

    , 'dashboard':                              'dashboard'

    , 'businesses':                             'businesses'
    , 'businesses/page/:page':                  'businessesPaginate'
    , 'businesses/:bid':                        'businessDetails'

    , 'businesses/:bid/loyalty':                'businessLoyalty'

    , 'businesses/:bid/locations':              'businessLocations'
    , 'businesses/:bid/locations/page/:page':   'businessLocationsPaginate'
    , 'businesses/:bid/locations/create':       'businessLocationsCreate'
    , 'businesses/:bid/locations/:lid':         'businessLocationsEdit'

    , 'businesses/:bid/menu-details':           'businessMenuDetails'
    , 'businesses/:bid/menu-categories':        'businessMenuCategories'

    , 'accounts/users/page/:page':              'userAccounts'

    , 'login':                                  'login'
    , 'logout':                                 'logout'
    }

  , index: function(){
      utils.history.navigate('/dashboard', { trigger: true });
    }

  , dashboard: function(){
      troller.app.changePage('dashboard');
    }

  , businesses: function(){
      utils.history.navigate('businesses/page/1', { trigger: true });
    }

  , businessesPaginate: function(page){
      troller.app.changePage('businesses', { page: parseInt(page) || 0 }, function(){
        troller.businesses.setPage(parseInt(page) || 0);
      });
    }

  , businessDetails: function(id){
      troller.app.changePage('business', { id: parseInt(id), page: 'main' }, function(){
        troller.business.changePage('main');
      });
    }

  , businessLoyalty: function(id){
      troller.app.changePage('business', { id: parseInt(id), page: 'loyalty' }, function(){
        troller.business.changePage('loyalty');
      });
    }

  , businessLocations: function(id){
      utils.history.navigate('businesses/' + id + '/locations/page/1', { trigger: true });
    }

  , businessLocationsPaginate: function(id, page){
      troller.app.changePage('business', { id: parseInt(id), page: 'locations', pageNum: page }, function(){
        troller.business.changePage('locations', { pageNum: parseInt(page) });
      });
    }

  , businessLocationsCreate: function(bid){
      var location = utils.clone(config.defaults.location);
      location.businessId = parseInt(bid);
      api.locations.create(location, function(error, result){
        if (error) return alert(error);

        location.id = result.id;

        troller.app.changePage('business', { id: location.businessId, page: 'location' }, function(){
          troller.business.changePage('location', { locationId: result.id, location: location, isNew: true });
        });
      });
    }

  , businessLocationsEdit: function(bid, lid){
      troller.app.changePage('business', { id: parseInt(bid), page: 'location' }, function(){
        troller.business.changePage('location', { locationId: parseInt(lid) });
      });
    }

  , businessMenuDetails: function(bid){
      troller.app.changePage('business', { id: parseInt(bid), page: 'menu-details' }, function(){
        troller.business.changePage('menu-details');
      });
    }

  , businessMenuCategories: function(bid){
      window.location.href = window.location.origin + "/menu-categories/?businessId=" + bid;
    }

  , userAccounts: function(page){
      troller.app.changePage('accounts', { page: 'users' }, function(){
        troller.accounts.changePage('users', { pageNum: parseInt(page) || 1 })
        troller.users.setPage(parseInt(page) || 1);
      });
    }

  , login: function(){
      troller.app.changePage('login');
    }

  , logout: function(){
      troller.app.logout();
      troller.app.changePage('login');
    }
  });
});