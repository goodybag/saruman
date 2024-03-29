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
      , 'loyaltyEnabled'
      , 'galleryEnabled'
      , 'numUnconfirmedPunchesAllowed'
      ]

    , defaults: {
        id:                           'New'
      , locationId:                   null
      , businessId:                   null
      , loyaltyEnabled:               true
      , galleryEnabled:               true
      , numUnconfirmedPunchesAllowed: 0
      }

    , type: 'tapin-station'
    })
  ;

  return Model;
});