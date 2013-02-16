define(function(require){
  var
    domready  = require('domReady')
  , $         = require('jquery')
  , pubsub    = require('lib/pubsub')
  , channels  = require('lib/channels')
  , utils     = require('lib/utils')

  , user      = require('models/user')
  , AppView   = require('views/app')
  , AppRouter = require('lib/router')
  , api       = require('lib/api')
  , helpers   = require('lib/hbt-helpers')


    // Limited interface to application to work with through repl
  , app = {
      init: function(){
        domready(function(){
          app.appView = new AppView();

          $(document.body).append(app.appView.$el);

          // Handle change page requests
          pubsub.subscribe(channels.app.changePage.base, function(channel, data){
            // Parse out the page from the sub-channel
            var page = channel.substring(channel.lastIndexOf('.') + 1);

            user.isLoggedIn(function(error, loggedIn){
              if (error) return console.log(error);
              if (!loggedIn) return app.changePage("login");

              if (page === "login") page = "dashboard";

              // Make sure to apply view arguments
              app.changePage(page, data);
            });
          });

          pubsub.subscribe(channels.logout, app.logout);

          utils.history = Backbone.history;
          utils.history.start();
        });
      }

    , changePage: function(page, options){
        app.appView.changePage(page, options);
      }

    , router: new AppRouter()

    , logout: function(){
        user.logout();
        app.changePage('login');
      }
    }
  ;

  return app;
});