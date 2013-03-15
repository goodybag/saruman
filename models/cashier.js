define(function(require){
  var
    utils   = require('../lib/utils')
  , api     = require('../lib/api')
  , config  = require('../config')
  , Base    = require('./base-by-business')

  , Model = Base.extend({
      acceptable: [
        'id'
      , 'email'
      , 'password'
      , 'userId'
      , 'locationId'
      , 'businessId'
      , 'cardId'
      ]

    , defaults: {
        id: 'New'
      , locationId: null
      , businessId: null
      }

    , type: 'cashier'
    })
  ;

  return Model;
});