define(function(require){
  var
    Backbone  = require('backbone')
  , Page      = require('./page')
  , template  = require('hbt!./../templates/page-login')
  , user      = require('../models/user')
  , pubsub    = require('../lib/pubsub')
  , channels  = require('../lib/channels')
  ;

  return Page.extend({
    className: 'page page-login'

  , events: {
      'submit #login-form': 'onLoginSubmit'
    }

  , initialize: function(){
      this.template = template;
    }

  , onLoginSubmit: function(e){
      e.preventDefault();

      var
        email     = this.$el.find('#input-email').val()
      , password  = this.$el.find('#input-password').val()
      , this_     = this
      ;

      user.auth(email, password, function(error){
        if (error)
          return this_.$el.find('.errors').html('<p class="text-error">Invalid Email/Password</p>');

        Backbone.history.navigate('businesses');
        pubsub.publish(channels.app.changePage.businesses, { page: 1 });
      });
    }
  });
});