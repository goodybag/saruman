define(function(require) {
  var _ = require('underscore');
  var bus = require('../../../lib/pubsub');
  var MsgView = require('../msg-view');
  var Section = require('../section');
  var api = require('../../../lib/api');
  var utils = require('../../../lib/utils');
  var ProductFilter = require('../../../lib/bizpanel/product-filter');

  var GalleryOrderEditor = MsgView.extend({
    initialize: function() {
      this.productFilter = new ProductFilter({
        hideUncategorized: true,
        hideSpotlight: false
      });
      this.template = require('hbt!../../../templates/bizpanel/gallery-order-editor');
    },
    render: function(menu) {
      if(!menu) return;
      var viewData = {
        products: this.productFilter.filterProducts(menu.products),
        categories: this.productFilter.getCategorySelectView(menu.sections)
      };
      this.$el.html(this.template(viewData));
    },
    subscribe: {
      saveCategoryOrderEdits: function() {
        alert('not implemented')
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
