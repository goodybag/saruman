define(function(require) {
  var Section = require('../section');
  var menu = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/menu'),
    icon: 'food',
    url: '#panel/menu',
    text: 'Menu Items'
  }));
  return menu;
});