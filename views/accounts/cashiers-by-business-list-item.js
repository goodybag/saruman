define(function(require){
  var
    utils     = require('../../lib/utils')
  , config    = require('../../config')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , BaseListItem = require('./base-list-item-by-business')

  , template  = require('hbt!./../../templates/accounts/cashiers-by-business-list-item')
  ;

  return BaseListItem.extend({
    type: 'cashiers'

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      options = options || {};

      this.isNew      = !!options.isNew;
      this.business   = options.business;

      this.mode = 'read';

      this.template = template;

      this.on('render', this.onRender, this);

      for (var key in BaseListItem.prototype.events){
        if (!(key in this.events)) this.events[key] = BaseListItem.prototype.events[key];
      }

      this.delegateEvents();

      return this;
    }

  , onBusinessChange: function(e){
      this.model.set('businessId', parseInt(e.target.value));
      this.render();
      this.enterEditMode();
    }

  , getAdditionalSelect2Properties: function(){
      return {
        allowClear: false
      };
    }

    /**
     * When the view renders, the object returned by this function
     * will be mixed into the object that gets passed into the template
     */
  , getAdditionalRenderProperties: function(){
      return {
        locations:    this.business.locations
      }
    }
  });
});