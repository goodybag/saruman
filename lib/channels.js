define(function(require){
  return {
    app: {
      base:                 'app'
    , changePage: {
        base:               'app.change-page'
      , businesses:         'app.change-page.businesses'
      , business:           'app.change-page.business'
      , dashboard:          'app.change-page.dashboard'
      , login:              'app.change-page.login'
      }
    }

  , businesses: {
      base:                 'businesses'
    , pagination:           'businesses.pagination'
    }

  , business: {
      base:                 'business'
    , changePage: {
        base:               'business.change-page'
      , main:               'business.change-page.main'
      , locations:          'business.change-page.locations'
      , location:           'business.change-page.location'
      , menuDetails:        'business.change-page.menu-details'
      , menuCategories:     'business.change-page.menu-categories'
      }
    }

  , logout:                 'logout'
  };
});