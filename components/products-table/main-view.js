/**
 * Table View Component
 */

define(function(require){
  var
    utils       = require('../../../lib/utils')
  , troller     = require('../../../lib/troller')
  , api         = require('../../../lib/api')
  , config      = require('../../../config')

  , Components  = require('../../../lib/components')

  , template    = require('hbt!./table-tmpl')
  , ItemView    = require('./item-view')
  , ItemModel   = require('./item-model')
  ;

  return Components.Table.Main.extend({
    initialize: function(options){
      options = options || {};

      options.template  = template;
      options.ItemView  = ItemView;
      options.ItemModel = ItemModel;

      options.headers   = {
        name:             config.niceNames.name
      , description:      config.niceNames.description
      , price:            config.niceNames.price
      , categories:       config.niceNames.categories
      , tags:             config.niceNames.tags
      , photoUrl:         config.niceNames.photoUrl
      };

      return Components.Table.Main.initialize.call(this, options);
    }
  });
});