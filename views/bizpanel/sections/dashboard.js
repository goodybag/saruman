define(function(require) {
  var Section = require('../section');
  var dashboard = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/dashboard'),
    editTpl:require('hbt!../../../templates/page-business-details-location-edit'),
    icon: 'home',
    url: '#panel/dashboard',
    text: 'Dashboard',
    render: function(data) {
      this.$el.html(this.template(this.data||{}))
      this.$el.html(this.editTpl(this.data.location || {}))
    }
  }));
  return dashboard;
});
