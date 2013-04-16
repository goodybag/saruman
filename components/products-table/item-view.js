define(function(require){
  var
    utils       = require('../../lib/utils')
  , config      = require('../../config')
  , api         = require('../../lib/api')
  , troller     = require('../../lib/troller')
  , Components  = require('../../lib/components')

  , template    = require('hbt!./list-item-tmpl')
  ;

  return Components.Table.Item.extend({
    initialize: function(options){
      options = options || {};

      options.template = options.template || template;

      return Components.Table.Item.intialize.call(this, options);
    }

  , render: function(){
      Components.Table.Item.render.call(this);

      // Add in photo editors
      this.find('.photo-editor').replaceWith(
        new Components.PhotoEditor.Main({
          model:  this_.model
        }).render().$el;
      );
    }

  , getAdditionalSelect2Properties: function(){ return {}; }

  , getAdditionalRenderProperties: function(){ return {}; }
  });
});