define(function(require){
  var
    Backbone  = require('backbone')
  , $         = require('jquery')
  , api       = require('../lib/api')
  , pubsub    = require('../lib/pubsub')
  , channels  = require('../lib/channels')

  , Page      = require('./page')

  , template  = require('hbt!../templates/page-business-details')

  , Views = {
      Nav:              require('./page-business-details-nav')
    , PageManager:      require('./page-manager')
    }

  , Pages = {
      main:             require('./page-business-details-main')
    , loyalty:          require('./page-business-details-loyalty')
    , locations:        require('./page-business-details-locations')
    , location:         require('./page-business-details-location-edit')
    , 'menu-details':   require('./page-business-details-menu')
    }
  ;

  return Page.extend({
    className: 'page page-business-details'

  , initialize: function(options){
      this.business = {
        id: options.id
      };

      this.hasLoadOnced = false;

      this.currentPage = options.page || 'main';

      this.children = {
        nav:    new Views.Nav({ business: this.business })
      , pages:  new Views.PageManager({ Pages: Pages, parentView: this })
      };

      var this_ = this;

      // Listen for when we go to this section
      pubsub.subscribe(channels.app.changePage.business, function(channel, data){
        console.log(channel, data);

        // Update the businessId
        this_.business.id = data.id;

        // Change page
        if (data.page && this_.hasLoadedOnce) this_.changePage(data.page);

        // Get new business
        if ((this_.business && this_.business.id != data.id) || !this_.hasLoadedOnce) this_.fetchBusiness();
      });

      // Listen for page changes
      pubsub.subscribe(channels.business.changePage.base, function(channel, data){
        var page = channel.substring(channel.lastIndexOf('.') + 1);
        if (this.currentPage !== page){
          data = data || {};
          data.business = this_.business;
          data.businessId = this_.business.id;
          console.log(channel, data);
          this_.changePage(page, data);
        }
      });

      pubsub.publish(channels.app.changePage.business, this.business);
      this.changePage(this.currentPage, { business: this.business, page: 0 });

      return this;
    }

  , fetchBusiness: function(){
      var this_ = this;
      api.businesses.get(this.business.id, function(error, business){
        if (error) return console.error(error);

        this_.hasLoadedOnce = true;

        // Mix into object so it reflects across all objects
        for (var key in business){
          this_.business[key] = business[key];
        }

        // Delete isGb and isVerified to fix some patching bugs
        delete this_.business.isGB;
        delete this_.business.isVerified;

        // Alert the current view that the business has changed
        console.log(this_.children.pages.current)
        if (this_.children.pages.current.onBusinessChange)
          this_.children.pages.current.onBusinessChange();

        // Re-render the current page view with new business
        this_.render();
        this_.delegateEvents();
      });
    }

  , render: function(){
      this.$el.html(template({
        business: this.business || {}
      , page: this.children.pages.pages[this.currentPage].name
      }));

      this.children.nav.render();
      this.children.pages.renderCurrent();
      this.$el.find('#business-details-nav').append(this.children.nav.$el);
      this.$el.find('#business-details-pages').append(this.children.pages.$el);

      // Highlight menu
      this.children.nav.$el.find('.' + this.currentPage).addClass('active');

      // Delegate events to current Page
      console.log("rendered", this.currentPage);
      // this.children.pages.pages[this.children.pages.current].delegateEvents();

      return this;
    }

  , changePage: function(page, options){
      this.children.pages.changePage(page, options);
      this.currentPage = page;

      // Highlight menu
      this.children.nav.$el.find('li').removeClass('active');
      this.children.nav.$el.find('.' + this.currentPage).addClass('active');

      // Change page name
      var current = this.children.pages.pages[this.currentPage];
      console.log(current);
      if (current.name)
        this.$el.find('.business-page-name > .name').css('display', 'inline').html(current.name);
      else
        this.$el.find('.business-page-name > .name').css('display', 'none');

      return this;
    }
  });
});