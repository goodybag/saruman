//base class for views to auto-wire to message bus
define(function(require) {
  var bus = require('../../lib/pubsub');
  var utils = require('../../lib/utils');
  var subscribe = require('../../lib/bizpanel/subscribe');

  var MsgView = utils.View.extend({
    data: {},
    constructor: function() {
      MsgView.__super__.constructor.apply(this, arguments);
      //utils.View.prototype.constructor.apply(this, arguments);
      this._subscribe();
    },
    _subscribe: function() {
      subscribe(this);
    },
    render: function(data) {
      var view = _.extend((this.data||{}), data||{});
      this.$el.html(this.template(view));
    }
  });
  return MsgView;
});
