define(function(require){
  var
    utils     = require('../../lib/utils')
  , config    = require('../../config')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , BaseListItem = require('./base-list-item')

  , template  = require('hbt!./../../templates/accounts/cashier-list-item')
  ;

  return BaseListItem.extend({
    type: 'cashiers'

  , 'change .businesses-select':       'onBusinessChange'

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      options = options || {};

      this.isNew        = !!options.isNew;
      this.businesses   = options.businesses;
      this.businessIds  = options.businessIds;

      this.mode = 'read';

      this.template = template;

      return this;
    }

  , onBusinessChange: function(e){
console.log('lkja');
      // this.model.set('businessId', parseInt(e.target.value));
      // this.render();
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
      var
        businessId = this.model.get('id') === 'New'
                   ? this.businesses[0].id
                   : this.model.get('businessId')

      , locations  = this.businessIds[businessId].locations
      , locationName
      ;

      if (this.model.get('id') === 'New')
        this.model.set('businessId', businessId);

      return {
        businesses:   this.businesses
      , businessName: this.businessIds[businessId].name
      , locations:    this.businessIds[businessId].locations
      }
    }
  });
});