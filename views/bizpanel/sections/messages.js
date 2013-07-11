define(function(require) {
  var _ = require('underscore');

  var Section = require('../section');
  var messages = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/messages'),
    url: '#messages',
    icon: 'user',
    text: 'Messaging'
  }));

  return messages;
});
