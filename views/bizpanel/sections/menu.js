define(function(require) {
  var utils = require('../../../lib/utils');
  var bus = require('../../../lib/pubsub');
  var Section = require('../section');
  var api = require('../../../lib/api');
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
      console.log(product)
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
      result.photoUrl = this.$el.find('#product-image').attr('src');
      if(result.photoUrl.indexOf('placekitten.com') > 0) {
        delete result.photoUrl;
      }
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

  var UNCATEGORIZED = 'uncategorized';
  var productFilter = {
    _categoryFilter: 'all',
    _search: '',
    setSearchString: function(text) {
      this._search = text.toLowerCase();
      this.searchString = text;
    },
    //set the category filter
    //based on the raw value from the select
    setCategoryFilter: function(rawVal) {
      //can be either a categoryId or special keywords
      var num = parseInt(rawVal);
      this._categoryFilter = num ? num : rawVal;
    },
    _shouldFilter: function() {
      if(this._categoryFilter != '' && this._categoryFilter != 'all') return true;
    },
    //returns filtered list of products
    filterProducts: function(products) {
      var self = this;
      var shouldFilter = this._shouldFilter();
      var shouldSearch = this._search.length > 0;
      if(!shouldFilter && !shouldSearch) return products;
      return _.filter(products, function(product) {
        var category = product.categories[0];
        if(shouldSearch) {
          var toSearch = product.name + product.description;
          if(category) {
            toSearch += category.name;
          }
          toSearch = toSearch.toLowerCase();
          if(toSearch.indexOf(self._search) < 0) {
            return false;
          }
        }
        if(shouldFilter) {
          if(category) {
            return category.id == self._categoryFilter;
          }
          return self._categoryFilter == UNCATEGORIZED;
        }
        return true;
      });
    },
    //returns view object
    //to bind to category select dropdown
    //based on menu section
    getCategorySelectView: function(sections) {
      var self = this;
      var result = [];
      var all = {
        value: all,
        name: 'All',
        selected: false
      };
      var matched = false;
      result.push(all);
      _.each(sections, function(section) {
        var option = {
          value: section.id,
          name: section.name,
          selected: false
        };
        if(section.id == self._categoryFilter) {
          option.selected = matched = true;
        }
        result.push(option);
      });
      var uncategorized = {
        value: UNCATEGORIZED,
        name: 'Uncategorized'
      };
      result.push(uncategorized);
      //if no filter, match 'all'
      if(!matched) {
        if(this._categoryFilter == UNCATEGORIZED) {
          uncategorized.selected = true;
        } else {
          //a total non-match can happen if
          //the category filter is applied and then
          //a user deletes a category filter
          all.selected = true;
          //clear category filter
          this._categoryFilter = 'all';
        }
      }
      return result;
    }
  }

  var menu = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/menu'),
    icon: 'food',
    url: '#panel/menu',
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
        this.productEditView.render({price: 100});
        this.showProductEditView('Add New Menu Item');
      },
      editProduct: function(msg) {
        for(var i = 0; i < this.menu.products.length; i++) {
          var product = this.menu.products[i];
          if(product.id == msg.id) {
            console.log(product);
            this.productEditView.render(product);
            this.showProductEditView();
          }
        }
      },
      sortProducts: function(msg) {
        msg.sortDirection = msg.sortDirection == 'ASC' ? 'DESC' : 'ASC';
        this.sort(msg.sortField, msg.sortDirection);
        this.render();
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
      //basically a click handler at this point
      editCategories: function() {
        this.$el.find('#menuView').hide();
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
