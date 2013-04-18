define(function(require){
  var
    utils   = require('../lib/utils')
  , api     = require('../lib/api')
  , config  = require('../config')
  , Base    = require('./base')

  , Model = Base.extend({
      acceptable: [
        'id'
      , 'name'
      , 'description'
      , 'price'
      , 'tags'
      , 'categories'
      , 'photoUrl'
      ]

    , defaults: {
        id:                           'New'
      , name:                         'New Product'
      , price:                        0
      }

    , resource: 'products'
    })
  ;

  return Model;
});