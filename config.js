define(function(require){
  return {
    apiUrl: 'http://localhost:3000/'

  , cuisineTypes: [
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
  };
});

define(function(require){
  var config = {
    dev: {
      apiUrl: 'http://localhost:3000/'

    , cuisineTypes: [
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
    }

  , prod: {
      apiUrl: 'http://localhost:3000/'

    , cuisineTypes: [
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
    }
  };

  // Build step will change this to prod
  return config.dev;
});