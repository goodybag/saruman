define(function(require) {
  var bus = require('../../../lib/pubsub');
  var Section = require('../section');
  var api = require('../../../lib/api');
  var loader = require('../../../lib/bizpanel/menu-loader');
  var MenuSectionEditor = require('../menu-section-editor');
  var editor = new MenuSectionEditor();
  var menu = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/menu'),
    icon: 'food',
    url: '#panel/menu',
    text: 'Menu Items',
    getEditCategoriesModal: function() {
      return $('#editCategoriesModal');
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
        this.render(menu);
      },
      editProduct: function(msg) {
        for(var i = 0; i < this.products.length; i++) {
          var product = this.products[i];
          if(product.id == msg.id) {
            console.log(product);
          }
        }
      },
      //basically a click handler at this point
      editCategories: function() {
        this.getEditCategoriesModal().modal().find('.modal-body').html(editor.$el);
      }
    }
  }));
  return menu;
});
