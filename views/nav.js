define(function(require){
  var
    Backbone = require('backbone')

  , template = require('hbt!../templates/nav')
  ;

  return Backbone.View.extend({
    className: 'navbar navbar-inverse navbar-fixed-top'

  , initialize: function(){

    }

  , render: function(){
      this.$el.html(template());
    }
  });
});