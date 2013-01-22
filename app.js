define(function(require){
  var
    domready  = require('domReady')
  , $         = require('jquery')
  , pubsub    = require('lib/pubsub')

  , user      = require('models/user')
  , AppView   = require('views/app')
  , AppRouter = require('lib/router')
  , api       = require('lib/api')

  , app = {
      init: function(){
        domready(function(){
          app.appView = new AppView();
          $(document.body).append(app.appView.$el);

          // Handle change page requests
          pubsub.subscribe('change-page', function(action, page){
            user.isLoggedIn(function(error, loggedIn){
              if (error) return console.log(error);

              if (!loggedIn) return app.changePage("login");

              if (page === "login") page = "home";
              app.changePage(page);
            });
            app.appView.changePage(page);
          });

          Backbone.history.start();
        });
      }

    , changePage: function(page){
        app.appView.changePage(page);
      }

    , router: new AppRouter()
    }
  ;

  return app;
});