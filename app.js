define(function(require){
  var
    domready  = require('domReady')
  , $         = require('jquery')
  , pubsub    = require('lib/pubsub')
  , channels  = require('lib/channels')
  , utils     = require('lib/utils')
  , troller   = require('lib/troller')

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

          utils.history = Backbone.history;
          utils.history.start();
        });
      }

    , changePage: function(page, options, callback){
        if (typeof options === "function"){
          callback = options;
          options = {};
        }

        user.isLoggedIn(function(error, loggedIn){
          if (error) return console.log(error), callback && callback(error);
          if (!loggedIn){
            app.appView.changePage("login");
            return utils.history.navigate('/login');
          }

          if (page === "login") page = "dashboard";

          // Make sure to apply view arguments
          app.appView.changePage(page, options);

          if (callback) callback(null, app.appView.children.pages.pages[page]);
        });
      }

    , router: new AppRouter()

    , logout: function(){
        user.logout();
      }
    }
  ;

  troller.add('app.init',       app.init);
  troller.add('app.changePage', app.changePage);
  troller.add('app.logout',     app.logout);


  return app;
});