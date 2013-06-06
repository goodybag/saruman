define(function(require) {
  var MsgView = require('./msg-view');
  var Header = MsgView.extend({
    template: require("hbt!../../templates/bizpanel/header"),
    subscribe: {
      loadManagerBegin: function() {
        this.render();
      },
      loadManagerEnd: function(data) {
        this.render(data);
      }
    }
  });
  return Header;
});
