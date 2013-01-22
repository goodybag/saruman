define(function(require){
  var
    $      = require('jquery')
  , utils  = require('../utils')
  ;

  return {
    session: function(callback){
      utils.api.get('v1/session', callback);
    }

  , auth: function(email, password, callback){
      var data = { email: email, password: password };
      utils.api.post('v1/session', data, callback);
    }

  , logout: function(callback){
      utils.api.del('v1/session', callback);
    }
  };
});