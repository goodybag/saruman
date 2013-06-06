define(function(require) {
  var Section = require('../section');
  var dashboard = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/dashboard'),
    url: '#panel/dashboard',
    text: 'Dashboard'
  }));
  return dashboard;
});