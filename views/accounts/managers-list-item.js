define(function(require){
  var
    utils     = require('../../lib/utils')
  , config    = require('../../config')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , BaseListItem = require('./base-list-item')

  , template  = require('hbt!./../../templates/accounts/manager-list-item')
  ;

  return BaseListItem.extend({
    type: 'managers'

  , events: {
      'change .businesses-select':       'onBusinessChange'
    }

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      options = options || {};

      this.isNew        = !!options.isNew;
      this.businesses   = options.businesses;
      this.businessIds  = options.businessIds;

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
      var
        businessId = this.model.get('businessId')

      , business = this.businessIds[businessId] || {}

      , locations  = business.locations || []
      , locationName
      ;

      if (this.model.get('id') === 'New')
        this.model.set('businessId', businessId);

      return {
        businesses:   this.businesses
      , businessName: business.name
      , locations:    locations
      }
    }
  });
});