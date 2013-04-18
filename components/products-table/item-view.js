define(function(require){
  var
    utils       = require('../../lib/utils')
  , config      = require('../../config')
  , api         = require('../../lib/api')
  , troller     = require('../../lib/troller')
  , TableItem   = require('../table/component').Item
  , PhotoEditor = require('../photo-editor/component').Main

  , template    = require('hbt!./list-item-tmpl')
  ;

  return TableItem.extend({
    initialize: function(options){
      options = options || {};

      options.template = options.template || template;

      return TableItem.prototype.initialize.call(this, options);
    }

  , render: function(){
      TableItem.prototype.render.call(this);

      // Add in photo editors
      this.$el.find('.photo-editor').replaceWith(
        new PhotoEditor({
          model:  this.model
        }).render().$el
      );

      return this;
    }

  , getAdditionalSelect2Properties: function(){ return {}; }

  , getAdditionalRenderProperties: function(){ return {}; }
  });
});