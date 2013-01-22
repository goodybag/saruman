define(function(require){
  var
    Backbone = require('backbone')

  , utils = require('../lib/utils')
  , api   = require('../lib/api')
  ;

  return new (Backbone.Model.extend({
    defaults: {
      loggedIn: false
    , email: null
    }

  , initialize: function(){
      return this;
    }

  , auth: function(email, password, callback){
      var this_ = this;

      callback = callback || utils.noop;

      this.isLoggedIn(function(error, loggedIn){
        if (error) return callback(error);

        if (loggedIn) return callback();

        this_.set('email', email);

        api.session.auth(email, password, function(error, result){
          if (error) return callback(error);

          this_.set('loggedIn', true);
          this_.set(result);

          this_.trigger('authenticated');

          callback();
        });
      });
    }

  , logout: function(callback){
      callback = callback || utils.noop;

      var this_ = this;

      api.session.destroy(function(error){
        if (error) return callback(error);

        this_.set('loggedIn', false);
      })
    }

  , isLoggedIn: function(callback){
      callback = callback || utils.noop;

      var this_ = this;

      // We previously set this to true, so it must be true!
      if (this.get('loggedIn') === true) return true;

      // We're uncertain, so make an api call
      api.session.get(function(error, result){
        if (error) return callback(error);

        if (!result || !result.id) return callback(null, false);

        this_.set('loggedIn', true);
        this_.set(result);
        callback(null, true);
      });

      return this;
    }
  }))();
});