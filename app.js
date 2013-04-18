define(function(require){
  var
    pubsub    = require('lib/pubsub')
  , utils     = require('lib/utils')
  , config    = require('./config')
  , troller   = require('lib/troller')
  , user      = require('models/user')
  , AppView   = require('views/app')
  , AppRouter = require('lib/router')
  , api       = require('lib/api')
  , helpers   = require('lib/hbt-helpers')


    // Limited interface to application to work with through repl
  , app = {
      init: function(){
        utils.domready(function(){
          app.appView = new AppView();

          utils.dom(document.body).append(app.appView.$el);

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

    , error: function(error, $el, action){
        if (typeof $el == 'function'){
          action = $el;
          $el = null;
        }

        if (!action) action = alert;

        if (error){
          var msg, detailsAdded = false;

          if (typeof error == "object")
            msg = error.message || (window.JSON ? window.JSON.stringify(error) : error);
          else
            msg = error;

          if (error.details){
            msg += "\n";
            for (var key in error.details){
              if ($el) $el.find('.field-' + key).addClass('error');
              if (error.details[key]){
                msg += "\n" + app.getKeyNiceName(key) + ": " + error.details[key] + ", ";
                detailsAdded = true;
              }
            }
            if (detailsAdded) msg = msg.substring(0, msg.length -2);
          }

          action(msg, error);

          return msg;
        }
      }

    , getKeyNiceName: function(key){
        return config.niceNames[key] || key;
      }

    , spinner: new utils.Spinner(config.spinner)

    , spin: function(el){
        if (typeof el == 'string')
          el = utils.dom(el)[0];

        if (!el) el = utils.dom('#main-loader')[0];

        if (el.id == 'main-loader') utils.dom(el).css('display', 'block');

        app.spinner.spin(el);
      }

    , stopSpinning: function(){
        utils.dom('#main-loader').css('display', 'none');
        app.spinner.stop();
      }

    , openModal: function(content){
        app.appView.openModal(content);
      }

    , closeModal: function(){
        app.appView.closeModal();
      }
    }
  ;

  troller.add('app.init',       app.init);
  troller.add('app.changePage', app.changePage);
  troller.add('app.logout',     app.logout);

  troller.add('app.error',      app.error);
  troller.add('error',          app.error);

  troller.add('spinner.spin',   app.spin)
  troller.add('spinner.stop',   app.stopSpinning)

  troller.add('modal.open',     app.openModal);
  troller.add('modal.close',    app.closeModal);

  return app;
});