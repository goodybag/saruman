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
    render: function() {
      //ensure menu is loaded
      if(!this.menu) return;
      var filteredProducts = this.productFilter.filterProducts(this.products);
      var sortProperty = this.isSpotlight ? 'spotlightOrder' : 'galleryOrder';
      //sort products by particular order
      this.filteredProducts = _.sortBy(filteredProducts, sortProperty);
      //normalize orders to an increasing number, remove gaps in ordering
      _.each(this.filteredProducts, function(product, i) {
        product[sortProperty] = i;
      });
      var isSpotlight = this.isSpotlight;
      //build a 'view object'
      var productViews = _.map(this.filteredProducts, function(product, i) {
        var viewObj = {
          name: product.name,
          id: product.id,
          photoUrl: product.photoUrl,
          order: isSpotlight ? product.spotlightOrder : product.galleryOrder
        };
        if(typeof viewObj.order == 'undefined') {
          viewObj.order = i;
        }
        return viewObj;
      });
      var viewData = {
        products: productViews,
        categories: this.productFilter.getCategorySelectView(this.menu.sections)
      };
      this.$el.html(this.template(viewData));
    },
    subscribe: {
      loadMenuEnd: function(menu) {
        this.menu = menu;
        //create a new array of product pointers
        //so we can internally sort & manipulate order
        //without jacking up other sections' display
        this.products = _.map(menu.products, function(p) { return p});
      },
      saveCategoryOrderEdits: function() {
        alert('not implemented')
      },
      changeCategoryOrderCategory: function(msg) {
        var filter = msg.value;
        this.isSpotlight = msg.value === 'spotlight';
        this.productFilter.setCategoryFilter(msg.value);
        this.render();
      },
      moveProductUp: function(msg) {
        var id = parseInt(msg.id);
        //find product in our filtered list
        var products = this.filteredProducts;
        var property = this.isSpotlight ? 'spotlightOrder' : 'galleryOrder';
        for(var i = 1; i < products.length; i++) {
          var product = products[i];
          if(product.id != id) continue;
          var previousProduct = products[i-1];
          console.log('switching', product.name, 'with', previousProduct.name);
          var order = product[property];
          product[property] = previousProduct[property];
          previousProduct[property] = order;
        }
        this.render();
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
        var filteredProducts = this.productFilter.filterProducts(menu.products);
        viewData.products = _.sortBy(filteredProducts, 'name');
        viewData.categories = this.productFilter.getCategorySelectView(menu.sections);
      }
      this.$el.html(this.template(viewData));
      this.editor.render(menu);
      this.$el.find('#tablet-edit-container').html(this.editor.$el);
    },
    toggleSaving: function(id, type, showOrHide) {
      var className = '.tablet-product-row-' + id;
      var $row = this.$el.find(className).find('span.' + type).toggle(showOrHide);
      var $check = this.$el.find(className).find('input[type=checkbox].' + type).toggle(!showOrHide);
      return $check;
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
      },
      toggleProductGalleryBegin: function(msg) {
        this.toggleSaving(msg.id, 'inGallery', true);
      },
      toggleProductGalleryEnd: function(msg) {
        this.toggleSaving(msg.product.id, 'inGallery', false)
          .prop('checked', msg.product.inGallery ? 'checked' : '');
      },
      toggleProductSpotlightBegin: function(msg) {
        this.toggleSaving(msg.id, 'inSpotlight', true);
      },
      toggleProductSpotlightEnd: function(msg) {
        this.toggleSaving(msg.product.id, 'inSpotlight', false)
          .prop('checked', msg.product.inSpotlight ? 'checked' : '');
      }
    }
  }));
  return tablet;
});
