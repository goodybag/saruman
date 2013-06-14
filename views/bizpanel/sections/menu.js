define(function(require) {
  var bus = require('../../../lib/pubsub');
  var Section = require('../section');
  var api = require('../../../lib/api');
  var menu = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/menu'),
    icon: 'food',
    url: '#panel/menu',
    text: 'Menu Items',
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
        //load all products for business
        var params = { include: ['categories', 'inSpotlight', 'tags'] };
        var self = this;
        api.businesses.products.list(msg.businessId, params, function(err, res) {
          self.products = res;
          self.render({ products: res });
        });
      },
      loadMenuSectionsBegin: function(msg) {

      },
      editProduct: function(msg) {
        for(var i = 0; i < this.products.length; i++) {
          var product = this.products[i];
          if(product.id == msg.id) {
            console.log(product);
          }
        }
      }
    }
  }));
  return menu;
});
