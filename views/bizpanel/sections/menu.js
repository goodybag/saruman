define(function(require) {
  var utils = require('../../../lib/utils');
  var bus = require('../../../lib/pubsub');
  var Section = require('../section');
  var loader = require('../../../lib/bizpanel/menu-loader');
  var MenuSectionEditor = require('../menu-section-editor');
  var editor = new MenuSectionEditor();

  var MsgView = require('../msg-view');
  var ProductEditTemplate = require('hbt!../../../templates/bizpanel/product-edit');
  var ProductEditView = MsgView.extend({
    template: ProductEditTemplate,
    initialize: function() {
      this.tags = [];
    },
    events: {
      "blur #product-price-input": "testPrice"
    },
    testPrice: function(e) {
      var $el = $(e.target);
      var value = this.parsePrice($el.val());
      $el.val(parseFloat(value / 100, 10).toFixed(2))
    },
    //convert input value to number value in cents
    parsePrice: function(priceString) {
      var num = parseFloat(priceString);
      //NaN is less than 0
      return num <= 0 ? 0 : num * 100;
    },
    //set list of all tags belonging to this business
    setTags: function(tags) {
      this.tags = tags.map(function(tag) {
        return tag.tag;
      });
    },
    render: function(product) {
      var productCategory = null;
      if(product.categories) {
        productCategory = (product.categories[0]||0).id;
      }
      product.allCategories = _.map(this.sections, function(section) {
        return {
          name: section.name,
          id: section.id,
          selected: section.id == productCategory
        }
      });
      this.$el.html(this.template(product || {}));
      //dispose of old rendered select2
      if(this.$tagSelect) {
        this.$tagSelect.select2('destroy');
      }
      this.$tagSelect = this.$el.find('#product-tags-input').select2({
        tags: this.tags
      });
      if((product||0).tags) {
        var tagNames = _.pluck(product.tags, 'tag');
        this.$tagSelect.val(tagNames).trigger('change');
      }
      this.delegateEvents()
    },
    //returns values from edit form as a
    //product object ready to be sent to the API
    getValues: function() {
      var get = function(name) {
        return this.$el.find('form').find('#product-' + name + '-input');
      }.bind(this);
      var val = function(name) {
        return get(name).val();
      };
      var result = {};
      result.name = val('name');
      result.price = this.parsePrice(val('price'));
      result.categoryId = parseInt(val('category'));
      result.description = val('description');
      var sizedPhotoUrl = this.$el.find('#product-image').attr('src');
      result.photoUrl = utils.getRawPhotoUrl(sizedPhotoUrl);
      //result.displayOnTablet = get('tablet-display').is(':checked');
      //result.showInSpotlight = get('spotlight-display').is(':checked');
      result.tags = this.$tagSelect.val().split(',');
      //remove empty string as a tag
      result.tags = _.filter(result.tags, function(tag) {
        return tag.length > 0;
      });
      var id = parseInt(val('id'));
      if(id >= 0) {
        result.id = id;
      }
      var checkedChecboxes = this.$el.find('form').find('input.location-enabled:checkbox:checked');
      var locationIds = _.map(checkedChecboxes, function(el) {
        return $(el).data('locationId');
      })
      result.locationIds = locationIds;
      return result;
    },
    subscribe: {
      pickProductPhoto: function() {
        var self = this;
        var options = { mimetypes:['image/*'] };
        var callback = function(file) {
          //this_.business.logoUrl = file.url;
          self.$el.find('#product-image').attr('src', file.url);
        };
        filepicker.pick(options, callback, function(error){ 
          /*alert(error);*/
        });
      },
      loadMenuEnd: function(menu) {
        this.sections = menu.sections;
        this.render(menu.products[0])
      }
    }
  });

  var ProductFilter = require('../../../lib/bizpanel/product-filter');
  var productFilter = new ProductFilter({
    hideSpotlight: true
  });
  var menu = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/menu'),
    icon: 'food',
    url: '#menu',
    text: 'Menu Items',
    sortField: 'price',
    sortDirection: 'DESC',
    events: {
      "change select#categorySelect": "selectedCategoryChanged"
    },
    initialize: function() {
      this.productEditView = new ProductEditView();
      this.sortField = 'price';
      this.sortDirection = 'DESC';
      this.productFilter = productFilter;
    },
    selectedCategoryChanged: function(e) {
      var $el = $(e.target);
      this.productFilter.setCategoryFilter($el.val());
      this.render();
    },
    getSortIcon: function(sortDirection) {
      return sortDirection == 'DESC' ? 'icon-chevron-down' : 'icon-chevron-up';
    },
    render: function(menu) {
      menu = menu || this.menu || {sections:[], products: []};
      var data = {
        business: this.business,
        searchString: this.productFilter.searchString,
        sortField: this.sortField,
        sortDirection: this.sortDirection,
        sortIcon: this.getSortIcon(this.sortDirection),
        sections: this.productFilter.getCategorySelectView(menu.sections),
        products: this.productFilter.filterProducts(menu.products),
        //view model properties
        sortPrice: this.sortField == 'price',
        sortLikes: this.sortField == 'likes'
      };
      this.$el.html(this.template(data));
      this.$el.find('#productEditContainer').append(this.productEditView.$el);
    },
    getEditCategoriesModal: function() {
      return $('#editCategoriesModal');
    },
    getProductEditEl: function() {
      return this.$el.find('#productEditView');
    },
    showProductEditView: function(title) {
      this.$el.find('#menuView').hide();
      this.getProductEditEl().show()
      .find('#productEditTitle').text(title || 'Edit Menu Item');
    },
    hideProductEditView: function() {
      this.getProductEditEl().hide();
      this.$el.find('#menuView').show();
    },
    sort: function(sortField, sortDirection) {
      var products = this.menu.products;
      var bigger = -1;
      var smaller = 1;
      if(sortDirection == 'ASC') {
        bigger = 1;
        smaller = -1;
      }
      var sortedProducts = products.sort(function(a, b) {
        var aField = a[sortField];
        var bField = b[sortField];
        if(aField == bField) {
          //sort by name to maintain sane sort order
          return a.name > b.name ? bigger : smaller;
        };
        return aField > bField ? bigger : smaller;
      });
      //save the sort data so it can be rendered
      this.sortField = sortField;
      this.sortDirection = sortDirection;
      this.menu.products = sortedProducts;
    },
    subscribe: {
      loadManagerEnd: function(msg) {
        this.user = msg.user;
        this.business = msg.business;
        var reload = ((this.location||0).id != (msg.location||0).id);
        this.location = msg.location;
        if(reload) {
          var msg = {
            businessId: msg.business.id,
            locationId: msg.location.id
          }
          bus.publish('loadMenuBegin', msg);
        }
      },
      //expectes {businessId,locationId}
      loadMenuBegin: function(msg) {
        console.log('section menu', 'load menu');
      },
      loadMenuEnd: function(menu) {
        this.getEditCategoriesModal().hide();
        this.menu = menu;
        this.sort(this.sortField, this.sortDirection);
        this.productEditView.setTags(menu.tags);
        this.render(menu);
      },
      newProduct: function() {
        //create list of all existing products
        var locations = _.map(this.business.locations, function(location) {
          return {
            id: location.id,
            street1: location.street1,
            isAvailable: true
          }
        })
        this.productEditView.render({
          price: 100,
          locations: locations
        });
        this.showProductEditView('Add New Menu Item');
      },
      editProduct: function(msg) {
        for(var i = 0; i < this.menu.products.length; i++) {
          var product = this.menu.products[i];
          if(product.id == msg.id) {
            this.productEditView.render(product);
            this.showProductEditView();
          }
        }
      },
      sortProducts: function(msg) {
        msg.sortDirection = msg.sortDirection == 'ASC' ? 'DESC' : 'ASC';
        this.sort(msg.sortField, msg.sortDirection);
        this.render(this.menu);
      },
      cancelProductEdits: function() {
        this.hideProductEditView();
      },
      saveProductEdits: function() {
        var product = this.productEditView.getValues();
        this.publish('saveProductBegin', product);
      },
      saveProductEnd: function(product) {
        this.hideProductEditView();
      },
      editCategories: function() {
        this.$el.find('#menuView').hide();
        editor.sortAndRender();
        this.getEditCategoriesModal()
        .show()
        .find('#editCategoriesContent').html(editor.$el);
      },
      cancelMenuSectionEdits: function() {
        this.getEditCategoriesModal().hide();
        this.$el.find('#menuView').show();
      },
      searchProducts: function() {
        var searchString = $('#productSearchText').val();
        this.productFilter.setSearchString(searchString);
        this.render();
      }
    }
  }));
  return menu;
});
