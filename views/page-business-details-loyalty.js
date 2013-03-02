define(function(require){
  var
    Page              = require('./page')
  , utils             = require('../lib/utils')
  , api               = require('../lib/api')
  , troller           = require('../lib/troller')

  , template          = require('hbt!./../templates/page-business-details-loyalty')
  , resultTemplate    = require('hbt!./../templates/loyalty-result')
  ;

  return Page.extend({
    className: 'page page-business-details'

  , name: 'Loyalty'

  , events: {
      'submit #loyalty-form':  'onSubmit'
    , 'keyup .show-in-result':          'onShowInResultKeyup'
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
      this.businessId = options.businessId;
      this.business   = options.business;
      this.loyalty    = options.loyalty;

      this.fetchLoyalty();
    }

  , fetchLoyalty: function(){
      if (this.business == null || this.isFetchingLoyalty) return;
      this.isFetchingLoyalty = true;
      var this_ = this;

      api.businesses.loyalty.get(this.business ? this.business.id : this.businessId, function(error, loyalty){
        this.isFetchingLoyalty = false;
        if (error) console.error(error);
        this_.loyalty = loyalty;
        this_.render();
      });
    }

  , render: function(){
    console.log("rendering with", this.loyalty);
      this.$el.html(template(this.loyalty || {}));
      this.renderResults();
      return this;
    }

  , renderResults: function(){
      this.$el.find('#loyalty-result').html(resultTemplate(this.loyalty || {}));
      return this;
    }

  , updateModelWithFormData: function(){
      var $el;
      this.loyalty = this.loyalty || {};
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

      this.updateModelWithFormData();

      var this_ = this;

      var loyalty = utils.clone(this.loyalty);
      delete loyalty.id;
      delete loyalty.businessId;

      api.businesses.loyalty.update(this.business.id, loyalty, function(error){
        if (error) return console.error(error);

        troller.business.changePage('main');
        utils.history.navigate('/businesses/' + this_.business.id);
      });
    }
  });
});