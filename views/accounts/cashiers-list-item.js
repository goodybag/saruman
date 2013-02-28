define(function(require){
  var
    utils     = require('../../lib/utils')
  , config    = require('../../config')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , BaseListItem = require('./base-list-item')

  , template  = require('hbt!./../../templates/accounts/consumer-list-item')
  ;

  return BaseListItem.extend({
    type: 'cashiers'

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

  , getAdditionalRenderProperties: function(){
      var
        locations = this.businessIds[this.model.get('businessId')].locations
      , locationName
      ;

      // Find the location since we can't necessarily cache the list
      if (locations){
        for (var i = 0, l = locations.length; i < l; ++i){
          if (locations[i].id === this.model.get('locationId')){
            locationName = locations[i].name;
            break;
          }
        }
      }

      return {
        businesses:   this.businesses
      , businessName: this.businessIds[this.model.get('businessId')].name
      , locationName: locationName
      }
    }
  });
});