define(function(require){
  var
    $      = require('jquery')
  , utils  = require('../utils')
  ;

  return {
    list: function(query, callback){
      utils.api.get('v1/productCategories', query, callback);
    }

  , get: function(id, callback){
      utils.api.get('v1/productCategories/' + id, callback);
    }

  , create: function(data, callback){
      utils.api.post('v1/productCategories', data, callback);
    }

  , update: function(id, data, callback){
      utils.api.update('v1/productCategories/' + id, data, callback);
    }

  , delete: function(id, callback){
      utils.api.update('v1/productCategories/' + id, callback);
    }
  };
});