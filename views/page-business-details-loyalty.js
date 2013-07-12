define(function(require){
  var
    Page              = require('./page')
  , utils             = require('../lib/utils')
  , api               = require('../lib/api')
  , troller           = require('../lib/troller')

  , template          = require('hbt!./../templates/page-business-details-loyalty')
  , alertTemplate     = require('hbt!./../templates/page-alert')
  , resultTemplate    = require('hbt!./../templates/loyalty-result')

  , defaultModel = {
      requiredItem: null
    , reward: null
    , regularPunchesRequired: null
    , elitePunchesRequired: null
    , punchesRequiredToBecomeElite: null
    }
  ;

  return Page.extend({
    className: 'page page-business-details'

  , name: 'Loyalty'

  , events: {
      'submit #loyalty-form':           'onSubmit'
    , 'keyup .show-in-result':          'onShowInResultKeyup'
    , 'click .photo-url':               'onLogoClick'
    }

  , initialize: function(options){
      var this_ = this;

      options = options || {};

      this.businessId = options.businessId;
      this.business   = options.business;
      this.loyalty    = options.loyalty;

      // Bind view object to alert callback      
      utils.bindAll(this, 'alert');
    }

  , onShow: function(options){
      options = options || {};
      this.businessId = options.businessId;
      this.business   = options.business;
      this.loyalty    = options.loyalty || utils.clone(defaultModel);

      this.fetchLoyalty();
    }

  , fetchLoyalty: function(){
      if (this.business == null || this.isFetchingLoyalty) return;
      this.isFetchingLoyalty = true;
      var this_ = this;

      api.businesses.loyalty.get(this.business ? this.business.id : this.businessId, function(error, loyalty){
        this_.isFetchingLoyalty = false;
        if (error) troller.app.error(error);
        this_.loyalty = loyalty;
        this_.render();
      });
    }

  , render: function(){
      this.$el.html(template(this.loyalty || utils.clone(defaultModel)));
      this.renderResults();
      return this;
    }

  , renderResults: function(){
      this.$el.find('#loyalty-result').html(resultTemplate(this.loyalty || utils.clone(defaultModel)));
      return this;
    }

  , updateModelWithFormData: function(){
      var $el;
      this.loyalty = this.loyalty || utils.clone(defaultModel);
      for (var key in this.loyalty){
        if (($el = this.$el.find('#loyalty-' + key)).length > 0)
          this.loyalty[key] = $el.val();
      }

      return this;
    }

  , onShowInResultKeyup: function(e){
      this.updateModelWithFormData();
      this.renderResults();
    }

  , onSubmit: function(e){
      e.preventDefault();

      troller.spinner.spin();

      this.updateModelWithFormData();

      var this_ = this;

      var loyalty = utils.clone(this.loyalty);
      delete loyalty.id;
      delete loyalty.businessId;

      api.businesses.loyalty.update(this.business.id, loyalty, function(error){
        troller.spinner.stop();
      
        this_.$el.find('.error').removeClass('error');

        if (error) return troller.app.error(error, this_.$el, this_.alert);

        this_.doSuccessThing(this_.$el.find('.btn-primary'));
      });
    }

  , onLogoClick: function(e){
      var this_ = this;
      filepicker.pick(
        { mimetypes:['image/*'] },
        function(file){
          this_.business.photoUrl = file.url;
          api.businesses.loyalty.update(this_.business.id, { photoUrl: file.url }, utils.noop);
          e.target.src = file.url;
        },
        function(error){ /*alert(error);*/ }
      );
    }

  , alert: function(msg, error) {    
      // Show a bootstrap alert message
      var $alertContainer = this.$el.find('.alert-container')
        , template        = alertTemplate({ msg: msg, error: error});
      
      $alertContainer.html(template);
    }
  });
});