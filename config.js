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

    , defaults: {
        location: {
          name:     'Location 1'
        , street1:  '123 Foobar St'
        , city:     'Austin'
        , state:    'TX'
        , zip:      78701
        , lat:      0
        , lon:      0
        }
      }
    }

  , dev: {
      apiUrl: 'http://localhost:3000/'
    }

  , prod: {
      apiUrl: 'http://magic.india.goodybag.com/'
    }
  };

  for (var key in config.default){
    if (!(key in config.dev)) config.dev[key]   = config.default[key];
    if (!(key in config.prod)) config.prod[key] = config.default[key];
  }

  // Build step will change this to prod
  return config.dev;
});