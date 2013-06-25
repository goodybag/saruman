define(function(require) {
  var _ = require('underscore');

  var Section = require('../section');
  var messages = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/messages'),
    url: '#panel/messages',
    icon: 'user',
    text: 'Messaging',
    subscribe: {
      loadMenuEnd: function(menu) {
        _.each(menu.products, function(product) {

        });
      }
    }
  }));

  return messages;
});
