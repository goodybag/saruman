define(function(require){
  var
    utils     = require('../lib/utils')
  , $         = require('jquery')

  , Views = {
      Nav:          require('./nav')
    , PageManager:  require('./page-manager')
    }

  , Pages = {
      login:                require('./page-login')
    , dashboard:            require('./page-dashboard')
    , businesses:           require('./page-businesses')
    , business:             require('./page-business-details')
    , accounts:             require('./accounts/accounts-page')
    }
  ;

  return utils.View.extend({
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

      this.$el.append('<div id="main-loader"></div>');

      for (var key in this.children){
        this.children[key].render();
        this.$el.append(this.children[key].$el);
      }

      if (this.children.pages.current)
        this.children.pages.pages[this.children.pages.current].delegateEvents();

      return this;
    }

  , changePage: function(page, options){
    console.log('app.changePage', page);
      this.children.pages.changePage(page, options);
      return this;
    }
  });
});