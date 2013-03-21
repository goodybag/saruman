define(function(require){
  var
    api       = require('../lib/api')
  , utils     = require('../lib/utils')
  , troller   = require('../lib/troller')

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
    , 'menu-items':     require('./page-business-details-items')
    , 'tapin-stations': require('./accounts/tapin-stations-by-business-page')
    , cashiers:         require('./accounts/cashiers-by-business-page')
    , managers:         require('./accounts/managers-by-business-page')
    }
  ;

  return Page.extend({
    className: 'page page-business-details'

  , initialize: function(options){
      var this_ = this;

      troller.add('business.changePage', function(page, options){
        console.log("change to page", page, options);
        this_.changePage(page, options);
      });

      this.trollerPrefix = 'business';

      this.business = {
        id: options.id
      };

      this.children = {
        nav:    new Views.Nav({ business: this.business })
      , pages:  new Views.PageManager({ Pages: Pages, parentView: this })
      };

      this.hasLoadOnced = false;

      this.currentPage = options.page || 'main';

      this.changePage(this.currentPage, { business: this.business, page: 0 });

      return this;
    }

  , onShow: function(options){
      // Update the businessId
      this.business.id = options.id;

      // Change page
      if (options.page && this.hasLoadedOnce) this.changePage(options.page);

      // Get new business
      // if ((this.business && this.business.id != options.id) || !this.hasLoadedOnce) this.fetchBusiness();
      this.fetchBusiness();
    }

  , fetchBusiness: function(){
      if (this.isFetching) return this;
      this.isFetching = true;

      var this_ = this;

      utils.parallel({
        business: function(done){
          api.businesses.get(this_.business.id, function(error, business){
            return done(error, business);
          });
        }
      , locations: function(done){
          api.businesses.locations.list(this_.business.id, function(error, locations){
            return done(error, locations);
          });
        }
      }, function(error, result){
          this_.isFetching = false;
          if (error) return console.error(error);

          this_.hasLoadedOnce = true;

          // Mix into object so it reflects across all objects
          for (var key in result.business){
            this_.business[key] = result.business[key];
          }

          this_.business.locations = result.locations;

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

      options             = options             || {};
      options.business    = options.business    || this.business;
      options.businessId  = options.businessId  || this.business.id;

      options.trollerPrefix = options.trollerPrefix ? (options.trollerPrefix + '.') : '';
      options.trollerPrefix += this.trollerPrefix;
      console.log("changing to", page, options);

      this.children.pages.changePage(page, options);
      this.currentPage = page;

      // Highlight menu
      this.children.nav.$el.find('li').removeClass('active');
      this.children.nav.$el.find('.' + this.currentPage).addClass('active');

      // Change page name
      var current = this.children.pages.pages[this.currentPage];

      if (current.name)
        this.$el.find('.business-page-name > .name').css('display', 'inline').html(current.name);
      else
        this.$el.find('.business-page-name > .name').css('display', 'none');

      return this;
    }
  });
});