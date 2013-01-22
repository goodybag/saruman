define(function(require){
  var
    Backbone  = require('backbone')
  , $         = require('jquery')

  , Views = {
      Nav:          require('./nav')
    , PageManager:  require('./page-manager')
    }

  , Pages = {
      login: require('./login')
    }
  ;
  return Backbone.View.extend({
    className: 'app-view'

  , children: {
      nav:    new Views.Nav()
    , pages:  new Views.PageManager({ Pages: Pages })
    }

  , initialize: function(){
      this.render();
      return this;
    }

  , render: function(){
      this.$el.html("");
      for (var key in this.children){
        this.children[key].render();
        this.$el.append(this.children[key].$el);
      }
      return this;
    }

  , changePage: function(pageName){
      this.children.pages.changePage(pageName);
      return this;
    }
  });
});