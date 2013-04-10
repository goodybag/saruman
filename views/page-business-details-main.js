define(function(require){
  var
    Page              = require('./page')
  , pubsub            = require('../lib/pubsub')
  , api               = require('../lib/api')
  , utils             = require('../lib/utils')
  , troller           = require('../lib/troller')

  , template          = require('hbt!./../templates/page-business-details-main')
  ;

  return Page.extend({
    className: 'page page-business-details'

  , events: {
      'submit #business-details-form':  'onSubmit'
    , 'click .delete-btn':              'onDelete'
    , 'click .business-logo':           'onLogoClick'
    }

  , initialize: function(options){
      var this_ = this;

      options = options || {};

      this.business = options.business;
    }

  , render: function(){
      this.$el.html(template(this.business || {}));
      return this;
    }

  , onLogoClick: function(e){
      var this_ = this;
      filepicker.pick(
        { mimetypes:['image/*'] },
        function(file){
          this_.business.logoUrl = file.url;
          api.businesses.update(this_.business.id, { logoUrl: file.url }, utils.noop);
          e.target.src = file.url;
        },
        function(error){ /*alert(error);*/ }
      );
    }

  , onSubmit: function(e){
      troller.spinner.spin();

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

        troller.spinner.stop();
        this_.doSuccessThing(this_.$el.find('.btn-save-changes'));
      });
    }

  , onDelete: function(e){
      e.preventDefault();

      if (!confirm("Are you absolutely 100% completely positive that you want to impose your executive kill decision on this business??!")) return;

      api.businesses.delete(this.business.id, function(error){
        if (error) return alert(error.message);

        utils.history.navigate('/businesses/page/1', { trigger: true });
      });
    }
  });
});