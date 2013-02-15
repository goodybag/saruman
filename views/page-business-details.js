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

      this.currentPage = options.page || 'main';

      this.children = {
        nav:    new Views.Nav({ business: this.business })
      , pages:  new Views.PageManager({ Pages: Pages, parentView: this })
      };

      var this_ = this;

      // Listen for when we go to this section
      pubsub.subscribe(channels.app.changePage.business, function(channel, data){
        // Update the businessId
        this_.business.id = data.id;

        // Get new business
        this_.fetchBusiness();
      });

      // Listen for page changes
      pubsub.subscribe(channels.business.changePage.base, function(channel, data){
        var page = channel.substring(channel.lastIndexOf('.') + 1);
        if (this.currentPage !== page){
          data = data || {};
          data.business = this_.business;
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

        // Mix into object so it reflects across all objects
        for (var key in business){
          this_.business[key] = business[key];
        }

        // Delete isGb and isVerified to fix some patching bugs
        delete this_.business.isGB;
        delete this_.business.isVerified;

        // Re-render the current page view with new business
        this_.render();
        this_.delegateEvents();
      });
    }

  , render: function(){
      this.$el.html(template(this.business));
      this.children.nav.render();
      this.children.pages.renderCurrent();
      this.$el.find('#business-details-nav').append(this.children.nav.$el);
      this.$el.find('#business-details-pages').append(this.children.pages.$el);

      // Highlight menu
      this.children.nav.$el.find('.' + this.currentPage).addClass('active');

      // Delegate events to current Page
      console.log("rendered", this.children.pages.current);
      // this.children.pages.pages[this.children.pages.current].delegateEvents();

      return this;
    }

  , changePage: function(page, options){
      this.children.pages.changePage(page, options);
      this.currentPage = page;
      // Highlight menu
      this.children.nav.$el.find('.' + this.currentPage).addClass('active');
      return this;
    }
  });
});