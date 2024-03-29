define(function(require){
  var
    $      = require('jquery')
  , utils  = require('../utils')
  ;

  return {
    list: function(query, callback){
      utils.api.get('v1/locations', query, callback);
    }

  , get: function(id, callback){
      utils.api.get('v1/locations/' + id, callback);
    }

  , create: function(data, callback){
      utils.api.post('v1/locations', data, callback);
    }

  , post: function(data, callback){
      utils.api.post('v1/locations', data, callback);
    }

  , update: function(id, data, callback){
      utils.api.update('v1/locations/' + id, data, callback);
    }

  , delete: function(id, callback){
      utils.api.del('v1/locations/' + id, callback);
    }

  , del: function(id, callback){
      utils.api.del('v1/locations/' + id, callback);
    }
  };
});