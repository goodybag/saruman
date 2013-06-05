//bizpanel dashboard
define(function(require) {
  var utils = require('../../lib/utils');
  var Page = require('../page');
  var template = require('hbt!../../templates/bizpanel/index');
  
  var Dashboard = Page.extend({
    initialize: function() {
      this.template = template;
    },
    render: function() {
      this.$el.html(this.template());
      return this;
    }
  });
  return Dashboard;
})
