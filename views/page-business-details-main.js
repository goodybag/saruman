define(function(require){
  var
    Page              = require('./page')
  , pubsub            = require('../lib/pubsub')
  , api               = require('../lib/api')
  , channels          = require('../lib/channels')
  , Paginator         = require('../lib/paginator')

  , template          = require('hbt!./../templates/page-business-details-main')
  ;

  return Page.extend({
    className: 'page page-business-details'

  , events: {
      'submit #business-details-form': 'onSubmit'
    , 'click input': 'test'
    }

  , test: function(){ alert('yay'); }

  , initialize: function(options){
      var this_ = this;

      this.business = options.business;

      // Listen for when they request to come to this page
      pubsub.subscribe(channels.business.changePage.main, function(channel){
        // this_.fetchBusiness();
      });

      this.business = options.business;
    }

  , fetchBusiness: function(){
      // var this_ = this;
      // api.businesses.get(this.business.id, function(error, business){
      //   if (error) return console.error(error);

      //   this_.business = business;

      //   this.
      // });
    }

  , render: function(){
      this.$el.html(template(this.business));
      return this;
    }

  , onSubmit: function(e){
    alert('test');
      e.preventDefault();

      var data = {
        name:               this.$el.find('#business-name').val()
      , businessCategory:   this.$el.find('#business-category').val()
      , url:                this.$el.find('#business-url').val()
      };

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