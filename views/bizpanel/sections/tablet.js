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
    initialize: function() {
    },
    render: function(data) {
      console.log('section-tablet','render');
      var self = this;
      this.$el.html(this.template(data || {}))
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
        }
      },
      loadMenuEnd: function(menuData) {

      }
    }
  }));
  return tablet;
});
