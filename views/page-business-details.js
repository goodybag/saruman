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
    , locations:        require('./dummy')
    // , locations:        require('./page-business-details-location')
    }
  ;

  return Page.extend({
    className: 'page page-business-details'

  , initialize: function(options){
      this.business = {
        id: options.id
      };

      this.currentPage = 'main';

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
      pubsub.subscribe(channels.business.changePage.base, function(channel){
        var page = channel.substring(channel.lastIndexOf('.') + 1);
        
        if (this.currentPage !== page){
          this_.changePage(page, { business: this_.business });
          this.currentPage = page;
        }
      });

      this.changePage(this.currentPage, { business: this_.business });

      this.fetchBusiness();

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

        // Re-render the current page view with new business
        this_.render();
      });
    }

  , render: function(){
      this.children.nav.render();
      this.children.pages.renderCurrent();
      this.$el.html(template(this.business));
      this.$el.find('#business-details-nav').append(this.children.nav.$el);
      this.$el.find('#business-details-pages').append(this.children.pages.$el);

      // Highlight menu
      this.children.nav.$el.find('.' + this.currentPage).addClass('active');

      // Hack :( - can't get backbone to delegate events
      if (this.currentPage === "main"){
        var main = this.children.pages.pages.main;
        main.$el.find('form').submit(main.onSubmit.bind(main));
      }

      return this;
    }

  , changePage: function(page, options){
      this.children.pages.changePage(page, options);
      return this;
    }
  });
});