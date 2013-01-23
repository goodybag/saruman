define(function(require){
  var
    Backbone = require('backbone')

  , template = require('hbt!../templates/page-business-details-nav')
  ;

  return Backbone.View.extend({
    className: 'nav nav-tabs nav-stacked'

  , events: {
      // 'click a': 'onNavClick'
    }

  , initialize: function(options){
      this.business = options.business;
    }

  , render: function(){
      this.$el.html(template(this.business));
    }

  , onNavClick: function(e){
      this.$el.find('li').removeClass('active');
      $(e.target).parent('li').addClass('active');
    }
  });
});