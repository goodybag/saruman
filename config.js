define(function(require){
  var config = {
    default: {
      cuisineTypes: [
        'American'
      , 'Asian'
      , 'Fusion'
      , 'Barbeque'
      , 'Brazillian'
      , 'Breakfast'
      , 'Burgers'
      , 'Cafes'
      , 'Caribbean'
      , 'Chinese'
      , 'Cuban'
      , 'Diners'
      , 'Ethiopian'
      , 'Greek'
      , 'Indian'
      , 'Italian'
      , 'Japanese'
      , 'Korean'
      , 'Mediterranean'
      , 'Mexican'
      , 'Pizza'
      , 'Sandwiches'
      , 'Seafood'
      , 'Sushi'
      , 'Thai'
      , 'Vegan'
      , 'Vegetarian'
      , 'Vietnamese'
      ]

    , groups: ['admin', 'sales', 'cashier', 'manager', 'consumer', 'tapin-station']

    , defaults: {
        location: {
          name:     'Location 1'
        , city:     'Austin'
        , state:    'TX'
        }

      , business: {
          name:         'New Business'
        , city:         'Austin'
        , state:        'TX'
        , isVerified:   true
        , isGB:         true
        , logoUrl:      'http://placekitten.com/520/520'
        }

      , avatarUrl: 'http://placekitten.com/250/250'
      }

    }

  , dev: {
      apiUrl: 'http://localhost:3000/'
    }

  , prod: {
      apiUrl: 'http://magic.goodybag.com/'
    }
  };

  for (var key in config.default){
    if (!(key in config.dev)) config.dev[key]   = config.default[key];
    if (!(key in config.prod)) config.prod[key] = config.default[key];
  }

  // Build step will change this to prod
  return config.dev;
});