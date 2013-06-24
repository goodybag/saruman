define(function(require) {
  var _ = require('underscore');
  var bus = require('../../../lib/pubsub');
  var MsgView = require('../msg-view');
  var Section = require('../section');
  var api = require('../../../lib/api');
  var utils = require('../../../lib/utils');
  var subscribe = require('../../../lib/bizpanel/subscribe');
  var ProductFilter = require('../../../lib/bizpanel/product-filter');

  var tabletGalleryLoader = {
    subscribe: {
      debugLoadLocationProducts: function(msg) {
        var url = 'v1/locations/' + msg.locationId + '/products';
        var params = {
          spotlight: true,
          all: true,
          include: ['tags', 'categories'],
          limit: 1000
        };
        utils.api.get(url, params, function(err, products) {
          console.log(products)
        });
      }
    }
  };
  subscribe(tabletGalleryLoader);

  var GalleryOrderEditor = MsgView.extend({
    initialize: function() {
      this.productFilter = new ProductFilter({
        hideUncategorized: true,
        hideSpotlight: false
      });
      this.productFilter.setCategoryFilter('spotlight');
      this.template = require('hbt!../../../templates/bizpanel/gallery-order-editor');
    },
    render: function(menu) {
      if(!menu) return;
      this.menu = menu;
      var viewData = {
        products: this.productFilter.filterProducts(menu.products),
        categories: this.productFilter.getCategorySelectView(menu.sections)
      };
      this.$el.html(this.template(viewData));
    },
    subscribe: {
      saveCategoryOrderEdits: function() {
        alert('not implemented')
      },
      changeCategoryOrderCategory: function(msg) {
        this.productFilter.setCategoryFilter(msg.value);
        this.render(this.menu);
      }
    }
  });

  var tablet = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/tablet'),
    url: '#panel/tablet',
    icon: 'desktop',
    text: 'Tablet Gallery',
    events: {
      "change select#categorySelect": "selectedCategoryChanged"
    },
    selectedCategoryChanged: function(e) {
      var $el = $(e.target);
      this.productFilter.setCategoryFilter($el.val());
      this.render();
    },
    initialize: function() {
      this.editor = new GalleryOrderEditor();
      this.productFilter = new ProductFilter({
        hideUncategorized: true,
        hideSpotlight: true
      });
    },
    render: function(menu) {
      console.log('section-tablet','render');
      var self = this;
      menu = menu || this.menu;
      var viewData = {
        products: [],
        categories: []
      };
      if(menu) {
        viewData.products = this.productFilter.filterProducts(menu.products);
        viewData.categories = this.productFilter.getCategorySelectView(menu.sections);
      }
      this.$el.html(this.template(viewData));
      this.editor.render(menu);
      this.$el.find('#tablet-edit-container').html(this.editor.$el);
    },
    subscribe: {
      loadMenuEnd: function(menu) {
        this.menu = menu;
        this.render(menu);
      },
      editTabletOrder: function() {
        this.$el.find('#tablet-view-container').hide();
        this.$el.find('#tablet-edit-container').show();
      },
      cancelCategoryOrderEdits: function() {
        this.$el.find('#tablet-edit-container').hide();
        this.$el.find('#tablet-view-container').show();
      }
    }
  }));
  return tablet;
});
