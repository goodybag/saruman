define(function(require){
  var
  , api       = require('../lib/api')
  , troller   = require('../lib/troller')

  , Page      = require('./page')

  , template  = require('hbt!../templates/accounts-page')

  , Views = {
      PageManager:      require('./page-manager')
    }

  , Pages = {
      users:             require('./accounts-users')
    }
  ;

  return Page.extend({
    className: 'page page-accounts'

  , initialize: function(options){
      var this_ = this;

      troller.add('accounts.changePage', function(page, options){
        console.log("change to page", page, options);
        this_.changePage(page, options);
      });

      this.children = {
        pages: new Views.PageManager({ Pages: Pages, parentView: this })
      };

      this.hasLoadOnced = false;

      this.currentPage = options.page || 'users';

      this.changePage(this.currentPage, { business: this.business, page: 0 });

      return this;
    }

  , onShow: function(options){

    }

  , render: function(){
      this.$el.html(template({
        page: this.children.pages.pages[this.currentPage].name
      }));

      this.children.nav.render();
      this.children.pages.renderCurrent();
      this.$el.find('#accounts-nav').append(this.children.nav.$el);
      this.$el.find('#accounts-pages').append(this.children.pages.$el);

      // Highlight menu
      this.children.nav.$el.find('li').removeClass('active');
      this.children.nav.$el.find('.' + this.currentPage).addClass('active');

      // Delegate events to current Page
      console.log("rendered", this.currentPage);
      // this.children.pages.pages[this.children.pages.current].delegateEvents();

      return this;
    }

  , changePage: function(page, options){
    console.log("changing to", page);
      options = options || {};

      this.children.pages.changePage(page, options);
      this.currentPage = page;

      // Highlight menu
      this.children.nav.$el.find('li').removeClass('active');
      this.children.nav.$el.find('.' + this.currentPage).addClass('active');

      // Change page name
      var current = this.children.pages.pages[this.currentPage];

      if (current.name)
        this.$el.find('.page-name > .name').css('display', 'inline').html(current.name);
      else
        this.$el.find('.page-name > .name').css('display', 'none');

      return this;
    }
  });
});