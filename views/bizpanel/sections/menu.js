define(function(require) {
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
    render: function(product) {
      this.product = product;
      this.$el.html(this.template(this.product || {}));
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
      result.price = val('price');
      result.category = val('category');
      result.description = val('description');
      result.photoUrl = this.$el.find('#product-img').attr('src');
      result.displayOnTablet = get('tablet-display').is(':checked');
      result.showInSpotlight = get('spotlight-display').is(':checked');
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
        this.render(menu.products[0])
      }
    }
  });


  var menu = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/menu'),
    icon: 'food',
    url: '#panel/menu',
    text: 'Menu Items',
    sortField: 'price',
    sortDirection: 'DESC',
    initialize: function() {
      this.productEditView = new ProductEditView();
      this.sortField = 'price';
      this.sortDirection = 'DESC';
    },
    getSortIcon: function(sortDirection) {
      return sortDirection == 'DESC' ? 'icon-chevron-down' : 'icon-chevron-up';
    },
    render: function(menu) {
      var data = {
        sortField: this.sortField,
        sortDirection: this.sortDirection,
        sortIcon: this.getSortIcon(this.sortDirection),
        menu: menu || this.menu || {},
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
          console.log(aField, 'equals', bField, 'sorting by name');
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
        this.getEditCategoriesModal().modal('hide')
        this.menu = menu;
        this.sort(this.sortField, this.sortDirection);
        this.render(menu);
      },
      newProduct: function() {
        this.productEditView.render({});
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
        this.getEditCategoriesModal().modal().find('.modal-body').html(editor.$el);
      }
    }
  }));
  return menu;
});
