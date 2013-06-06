define(function(require) {
  var Section = require('../section');
  var tablet = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/tablet'),
    url: '#panel/tablet',
    text: 'Tablet Gallery'
  }));
  return tablet;
});