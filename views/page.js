define(function(require){
  var
    utils = require('../lib/utils')
  ;

  return utils.View.extend({
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