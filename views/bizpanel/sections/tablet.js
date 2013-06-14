define(function(require) {
  var bus = require('../../../lib/pubsub');
  var Section = require('../section');
  var api = require('../../../lib/api');
  var utils = require('../../../lib/utils');
  var tablet = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/tablet'),
    url: '#panel/tablet',
    icon: 'desktop',
    text: 'Tablet Gallery',
    render: function(data) {
      console.log('section-tablet','render');
      this.$el.html(this.template(data || this.data || {}) + ' ' + new Date().getTime())
      var self = this;
    },
    subscribe: {
      loadManagerEnd: function(data) {
        if(!data) return;
        this.user = data.user;
        var locationChange = (this.location||0).id != data.location.id;
        this.location = data.location;
        this.business = data.business;
        if(locationChange) {
          this.render();
          //load menu on location change
          var msg = {
            businessId: data.business.id,
            locationId: data.location.id
          }
          bus.publish('loadProductsBegin', msg);
        }
      },
      //msg expects {busnessId,locationId}
      loadProductsBegin: function(msg) {
        return;
        console.log('loadProductsBeing', msg);
        var self = this;
        var url = 'v1/locations/' + msg.locationId + '/menu-sections';
        utils.api.get(url, {}, function(err, res) {
          console.log(res);
        })
      }
    }
  }));
  return tablet;
});
