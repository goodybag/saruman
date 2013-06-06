define(function(require) {

  var Section = require('../section');
  var messages = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/messages'),
    url: '#panel/messages',
    text: 'Messaging'
  }));

  return messages;
});