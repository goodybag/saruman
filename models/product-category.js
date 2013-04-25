define(function(require){
  var
    utils   = require('../lib/utils')
  , troller = require('../lib/troller')
  , api     = require('../lib/api')
  , config  = require('../config')
  , Base    = require('./base')

  , Model = Base.extend({
      acceptable: [
        'id'
      , 'name'
      , 'description'
      , 'order'
      , 'businessId'
      ]

    , defaults: {
        id:                           'New'
      , name:                         'New Category'
      , order:                        0
      , description:                  null
      }

    , types: {
        order:      'int'
      }

    , resource: 'productCategories'
    })
  ;

  return Model;
});