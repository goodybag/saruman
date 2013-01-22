define(function(require){
  var
    Backbone = require('backbone')
  ;

  return Backbone.View.extend({
    className: 'page'

  , render: function(){
      this.$el.html(this.template());
      return this;
    }

  , show: function(){
      this.$el.css('display', 'block');
      return this;
    }

  , hide: function(){
      this.$el.css('display', 'none');
      return this;
    }
  });
});