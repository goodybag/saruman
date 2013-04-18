define(function(require){
  var
    utils     = require('./utils')
  , config    = require('../config')
  , api       = require('./api')
  , user      = require('../models/user')
  , troller   = require('./troller')
  ;

  return utils.Router.extend({
    routes: {
      '':                                                 'index'

    , 'dashboard':                                        'dashboard'

    , 'businesses':                                       'businesses'
    , 'businesses/page/:page':                            'businessesPaginate'
    , 'businesses/page/:page/verified':                   'businessesVerified'
    , 'businesses/page/:page/unverified':                 'businessesUnVerified'
    , 'businesses/:bid':                                  'businessDetails'

    , 'businesses/:bid/loyalty':                          'businessLoyalty'

    , 'businesses/:bid/locations':                        'businessLocations'
    , 'businesses/:bid/locations/page/:page':             'businessLocationsPaginate'
    , 'businesses/:bid/locations/create':                 'businessLocationsCreate'
    , 'businesses/:bid/locations/:lid':                   'businessLocationsEdit'

    , 'businesses/:bid/menu-details':                     'businessMenuDetails'
    , 'businesses/:bid/products':                         'businessProducts'

    , 'businesses/:bid/tapin-stations/page/:page':        'businessTapInStations'
    , 'businesses/:bid/cashiers/page/:page':              'businessCashiers'
    , 'businesses/:bid/managers/page/:page':              'businessManagers'

    , 'accounts/users/page/:page':                        'userAccounts'
    , 'accounts/consumers/page/:page':                    'consumerAccounts'
    , 'accounts/cashiers/page/:page':                     'cashierAccounts'
    , 'accounts/managers/page/:page':                     'managerAccounts'
    , 'accounts/tapin-stations/page/:page':               'tapinStationAccounts'

    , 'login':                                            'login'
    , 'logout':                                           'logout'
    , 'oauth':                                            'oauth'
    , 'oauth/':                                           'oauth'
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
      troller.app.changePage('businesses', { page: parseInt(page) || 0, filter: {} });
    }

  , businessesVerified: function(page){
      troller.app.changePage('businesses', { page: parseInt(page) || 0, filter: { isVerified: true } });
    }

  , businessesUnVerified: function(page){
      troller.app.changePage('businesses', { page: parseInt(page) || 0, filter: { isVerified: false } });
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

  , businessProducts: function(bid){
      troller.app.changePage('business', { id: parseInt(bid), page: 'products' }, function(){
        troller.business.changePage('products');
      });
    }

  , businessTapInStations: function(bid, pageNum){
      troller.app.changePage('business', { id: parseInt(bid), page: 'tapin-stations' }, function(){
        troller.business['tapin-stations'].setPage(parseInt(pageNum) || 1);
      });
    }

  , businessCashiers: function(bid, pageNum){
      troller.app.changePage('business', { id: parseInt(bid), page: 'cashiers' }, function(){
        troller.business.cashiers.setPage(parseInt(pageNum) || 1);
      });
    }

  , businessManagers: function(bid, pageNum){
      troller.app.changePage('business', { id: parseInt(bid), page: 'managers' }, function(){
        troller.business.managers.setPage(parseInt(pageNum) || 1);
      });
    }

  , userAccounts: function(page){
      troller.app.changePage('accounts', { page: 'users' }, function(){
        troller.accounts.changePage('users', { pageNum: parseInt(page) || 1 })
        troller.users.setPage(parseInt(page) || 1);
      });
    }

  , consumerAccounts: function(page){
      troller.app.changePage('accounts', { page: 'consumers' }, function(){
        troller.accounts.changePage('consumers', { pageNum: parseInt(page) || 1 })
        troller.consumers.setPage(parseInt(page) || 1);
      });
    }

  , cashierAccounts: function(page){
      troller.app.changePage('accounts', { page: 'cashiers' }, function(){
        troller.accounts.changePage('cashiers', { pageNum: parseInt(page) || 1 })
        troller.cashiers.setPage(parseInt(page) || 1);
      });
    }

  , managerAccounts: function(page){
      troller.app.changePage('accounts', { page: 'managers' }, function(){
        troller.accounts.changePage('managers', { pageNum: parseInt(page) || 1 })
        troller.managers.setPage(parseInt(page) || 1);
      });
    }

  , tapinStationAccounts: function(page){
      troller.app.changePage('accounts', { page: 'tapin-stations' }, function(){
        troller.accounts.changePage('tapin-stations', { pageNum: parseInt(page) || 1 })
        troller.tapinStations.setPage(parseInt(page) || 1);
      });
    }

  , login: function(){
      troller.app.changePage('login');
    }

  , logout: function(){
      troller.app.logout(function(){
        console.log('change to login page');
        troller.app.changePage('login');
      });
    }

  , oauth: function(){
      troller.app.changePage('login');

      // Parse code string
      var code = window.location.href.split('?code=');

      if (code.length !== 2) return troller.app.error(new Error("Invalid code"));

      code = code[1];
      code = code.substring(0, code.indexOf('/#/oauth') === -1 ? code.indexOf('#/oauth') : code.indexOf('/#/oauth'));

      user.oauth(code, function(error){
        if (error) return alert(error.message), window.location.href = "/#/login";

        // Need to clear the query params
        window.location.href = "/#/dashboard";
        // troller.app.changePage('dashboard');
      });
    }
  });
});