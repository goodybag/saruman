define(function(require){
  var
    utils     = require('../lib/utils')
  , Page      = require('./page')
  , template  = require('hbt!./../templates/page-login')
  , user      = require('../models/user')
  , troller   = require('../lib/troller')
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

      this.$el.find('#input-password').val('');

      user.auth(email, password, function(error){
        if (error)
          return this_.$el.find('.errors').html('<p class="text-error">Invalid Email/Password</p>');

        troller.app.changePage('businesses', { page: 1 });
        utils.history.navigate('/businesses/page/1');
      });
    }
  });
});