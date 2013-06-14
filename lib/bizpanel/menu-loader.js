define(function(require) {
  var api = require('../api');
  var utils = require('../utils');
  var subscribe = require('./subscribe');
  return subscribe({
    loadProducts: function(businessId, cb) {
      var self = this;
      var params = {
        limit: 1000,
        include: ['categories', 'tags']
      };
      api.businesses.products.list(businessId, params, cb);
    },
    loadMenuSections: function(locationId, cb) {
      console.log('loading menu sections');
      var params = {
        limit: 1000,
        include: ['products']
      };
      utils.api.get('v1/locations/' + locationId + '/menu-sections', params, cb);
    },
    subscribe: {
      //expects {businessId, locationId}
      loadMenuBegin: function(msg) {
        var self = this;
        self.result = {
          products: [],
          sections: []
        };
        //load all products for this business
        this.loadProducts(msg.businessId, function(err, result) {
          console.log('loaded products');
          self.result.products = result;
          self.loadMenuSections(msg.locationId, function(err, result) {
            console.log('loaded menu sections');
            self.result.sections = result;
            self.publish('loadMenuEnd', self.result);
          });
        });
      }
    }
  });
});
