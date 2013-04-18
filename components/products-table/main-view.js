/**
 * Table View Component
 */

define(function(require){
  var
    utils       = require('../../../lib/utils')
  , troller     = require('../../../lib/troller')
  , api         = require('../../../lib/api')
  , config      = require('../../../config')

  , Table       = require('../table/component').Main

  , ItemView    = require('./item-view')
  , ItemModel   = require('../../models/product')
  ;

  return Table.extend({
    initialize: function(options){
      options = options || {};

      options.ItemView  = ItemView;
      options.ItemModel = ItemModel;

      options.headers = [
        config.niceNames.name
      , config.niceNames.description
      , config.niceNames.price
      , config.niceNames.categories
      , config.niceNames.tags
      , config.niceNames.photoUrl
      ];

      return Table.prototype.initialize.call(this, options);
    }
  });
});