define(function(require){
  var
    Backbone = require('backbone')
  ;

  return new (Backbone.Model.extend({
      initialize: function(){
        return this;
      }
  
    , isLoggedIn: function(callback){
        callback(null, false);
        return this;
      }
    }))();
});