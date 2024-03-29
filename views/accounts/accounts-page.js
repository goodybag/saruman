define(function(require){
  var
    api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , template  = require('hbt!../../templates/accounts/accounts-page')

  , Views = {
      PageManager:  require('../page-manager')
    , Page:         require('../page')
    }

  , Pages = {
      users:                require('./users-page')
    , consumers:            require('./consumers-page')
    , cashiers:             require('./cashiers-page')
    , managers:             require('./managers-page')
    , 'tapin-stations':     require('./tapin-stations-page')
    }

  , pageNames = {
      users:            'Users'
    , consumers:        'Consumers'
    , cashiers:         'Cashiers'
    , managers:         'Managers'
    , 'tapin-stations': 'TapIn Stations'
    , sales:            'Sales'
    }
  ;

  return Views.Page.extend({
    className: 'page page-accounts'

  , initialize: function(options){
      var this_ = this;

      troller.add('accounts.changePage', function(page, options){
        this_.changePage(page, options);
      });

      this.children = {
        pages: new Views.PageManager({
          Pages: Pages
        , parentView: this
        })
      };

      this.currentPage = options.page || 'users';

      return this;
    }

  , onShow: function(options){

    }

  , render: function(){
      this.$el.html(template({
        page: this.currentPage ? pageNames[this.currentPage] : null
      }));

      this.children.pages.renderCurrent();
      this.$el.find('#accounts-pages').append(this.children.pages.$el);

      // Highlight menu
      this.$el.find('.nav li').removeClass('active');
      this.$el.find('.nav .' + this.currentPage).addClass('active');

      // Delegate events to current Page
      console.log("rendered", this.currentPage);
      // if (this.currentPage) this.children.pages.pages[this.currentPage].delegateEvents();

      return this;
    }

  , changePage: function(page, options){
      options = options || {};
      this.children.pages.changePage(page, options);
      this.currentPage = page;

      // Highlight menu
      this.$el.find('.nav li').removeClass('active');
      this.$el.find('.nav .' + this.currentPage).addClass('active');

      // Change page name
      var current = this.children.pages.pages[this.currentPage];

      if (pageNames[this.currentPage])
        this.$el.find('.page-name > .name').css('display', 'inline').html(pageNames[current]);
      else
        this.$el.find('.page-name > .name').css('display', 'none');

      return this;
    }
  });
});