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

          // Not admin or sales, logout
          if (user.attributes.groups.indexOf('admin') === -1
          && user.attributes.groups.indexOf('sales') === -1
          && page !== 'login'){
            alert("You shall NOT PASS!");
            return app.logout(function(){
              app.changePage('login')
            });
          }

          if (page === "login") page = "dashboard";

          // Make sure to apply view arguments
          app.appView.changePage(page, options);

          if (callback) callback(null, app.appView.children.pages.pages[page]);
        });
      }

    , router: new AppRouter()

    , logout: function(callback){
        user.logout(callback);
      }

    , error: function(error){
        if (error.message) return alert(error.message);
        alert(error);
      }
    }
  ;

  troller.add('app.init',       app.init);
  troller.add('app.changePage', app.changePage);
  troller.add('app.logout',     app.logout);
  troller.add('app.error',      app.error);

  return app;
});