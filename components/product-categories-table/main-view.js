/**
 * Table View Component
 */

define(function(require){
  var
    utils       = require('../../lib/utils')
  , troller     = require('../../lib/troller')
  , api         = require('../../lib/api')
  , config      = require('../../config')

  , Table       = require('../table/component').Main

  , ItemView    = require('./item-view')
  , ItemModel   = require('../../models/product-category')
  ;

  return Table.extend({
    initialize: function(options){
      options = options || {};

      options.ItemView  = ItemView;
      options.ItemModel = ItemModel;

      options.headers = [
        config.niceNames.order
      , config.niceNames.name
      , config.niceNames.description
      ];

      return Table.prototype.initialize.call(this, options);
    }

  , getAdditionalViewOptions: function(){
      return {};
    }

  , getAdditionalModelOptions: function(){
      return {};
    }
  });
});