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

  , show: function(options){
      this.$el.css('display', 'block');
      if (this.onShow) this.onShow(options);
      return this;
    }

  , hide: function(options){
      this.$el.css('display', 'none');
      if (this.onHide) this.onHide(options);
      return this;
    }
  });
});