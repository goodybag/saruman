define(function(require){
  var
    utils       = require('../lib/utils')
  , Components  = require('../lib/components')

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
    , modal:  new Components.Modal.Main()
    }

  , initialize: function(){
      // render order
      this.children_ = [
        this.children.nav
      , this.children.pages
      , this.children.modal
      ];

      this.render();

      return this;
    }

  , render: function(){
      this.$el.html("");

      this.$el.append('<div id="main-loader"></div>');
      for (var i = 0, l = this.children_.length; i < l; ++i){
        this.children_[i].render();
        this.$el.append(this.children_[i].$el);
      }

      if (this.children.pages.current)
        this.children.pages.pages[this.children.pages.current].delegateEvents();

      return this;
    }

  , openModal: function(content){
      if (content) this.children.modal.setContent(content);
      this.children.modal.open();
      return this;
    }

  , closeModal: function(content){
      this.children.modal.close();
      return this;
    }

  , changePage: function(page, options){
    console.log('app.changePage', page);
      this.children.pages.changePage(page, options);
      return this;
    }
  });
});