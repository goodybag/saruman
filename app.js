define(function(require){
  var
    domready  = require('domReady')
  , $         = require('jquery')
  , pubsub    = require('lib/pubsub')

  , user      = require('models/user')
  , AppView   = require('views/app')
  , AppRouter = require('lib/router')

  , app = {
      init: function(){
        domready(function(){
          app.appView = new AppView();
          $(document.body).append(app.appView.$el);

          // Handle change page requests
          pubsub.subscribe('change-page', function(action, page){
            user.isLoggedIn(function(error, loggedIn){
              if (error) return console.log(error);
console.log("change-page event %s", page);
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