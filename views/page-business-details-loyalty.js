define(function(require){
  var
    Page              = require('./page')
  , pubsub            = require('../lib/pubsub')
  , api               = require('../lib/api')
  , channels          = require('../lib/channels')

  , template          = require('hbt!./../templates/page-business-details-loyalty')
  ;

  return Page.extend({
    className: 'page page-business-details'

  , name: 'Loyalty'

  , events: {
      'submit #business-details-form': 'onSubmit'
    }

  , initialize: function(options){
      var this_ = this;

      options = options || {};

      this.businessId = options.businessId;
      this.business   = options.business;
      this.loyalty    = options.loyalty;
    }

  , onShow: function(options){
      options = options || {};
console.log("onshow", options);
      this.businessId = options.businessId;
      this.business   = options.business;
      this.loyalty    = options.loyalty;

      this.fetchLoyalty();
    }

  , fetchLoyalty: function(){
      if (this.business == null || this.isFetchingLoyalty) return;
      this.isFetchingLoyalty = true;
console.log('fetching loyalty');
      var this_ = this;

      api.businesses.loyalty.get(this.business ? this.business.id : this.businessId, function(error, loyalty){
        this.isFetchingLoyalty = false;
        if (error) console.error(error);
console.log(loyalty);
        this_.loyalty = loyalty;
        this_.render();
      });
    }

  , render: function(){
    console.log("rendering with", this.loyalty);
      this.$el.html(template(this.loyalty || {}));
      return this;
    }

  , onSubmit: function(e){
      e.preventDefault();

      var data = {
        name:               this.$el.find('#business-name').val()
      , businessCategory:   this.$el.find('#business-category').val()
      , url:                this.$el.find('#business-url').val()
      };

      var this_ = this;

      api.businesses.update(this.business.id, data, function(error){
        if (error) return console.error(error);

        // Copy over business object
        for (var key in data){
          this_.business[key] = data[key];
        }

        this_.parentView.render();
      });
    }
  });
});