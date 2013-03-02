define(function(require){
  var
    $      = require('jquery')
  , utils  = require('../utils')
  ;

  return {
    list: function(query, callback){
      utils.api.get('v1/groups', query, callback);
    }

  , get: function(id, callback){
      utils.api.get('v1/groups/' + id, callback);
    }

  , create: function(data, callback){
      utils.api.post('v1/groups', data, callback);
    }

  , update: function(id, data, callback){
      utils.api.update('v1/groups/' + id, data, callback);
    }

  , delete: function(id, callback){
      utils.api.update('v1/groups/' + id, callback);
    }
  };
});