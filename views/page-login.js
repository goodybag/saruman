define(function(require){
  var
    utils     = require('../lib/utils')
  , Page      = require('./page')
  , template  = require('hbt!./../templates/page-login')
  , user      = require('../models/user')
  , troller   = require('../lib/troller')
  , api       = require('../lib/api')
  ;

  return Page.extend({
    className: 'page page-login'

  , events: {
      'submit #login-form':   'onLoginSubmit'
    , 'click .fb-login-btn':  'onFacebookLoginClick'
    }

  , initialize: function(){
      this.template = template;
    }

  , render: function(){
      var viewData = {
        isBizPanel: utils.context.isBizPanel()
      };
      this.$el.html(this.template(viewData));
      return this;
    }


  , onFacebookLoginClick: function(e){
      e.preventDefault();

      troller.spinner.spin();

      api.session.getOauthUrl(window.location.origin + '/%23/oauth/', 'facebook', function(error, data){
        if (error) return troller.app.error(error), troller.spinner.stop();

        // Pass control to singly
        window.location.href = data.url;
      });
    }

  , onLoginSubmit: function(e){
      e.preventDefault();

      troller.spinner.spin();

      var
        email     = this.$el.find('#input-email').val()
      , password  = this.$el.find('#input-password').val()
      , this_     = this
      ;

      this.$el.find('#input-password').val('');

      user.auth(email, password, function(error){
        troller.spinner.stop();

        if (error)
          return this_.$el.find('.errors').html('<p class="text-error">Invalid Email/Password</p>');

        var home = {
          name: 'businesses',
          options: { page: 1 },
          url: '/businesses/page/1'
        };

        if(!utils.context.isBizPanel()) {
          troller.app.changePage(home.name, home.options);
          utils.history.navigate(home.url);
        }

      });
    }
  });
});
