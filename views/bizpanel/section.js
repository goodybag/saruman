//a base class for each main 'section' of the bizpanel
//a 'section' corresponds to something on the left-hand nav
define(function(require) {
  var MsgView = require('./msg-view');
  var bus = require('../../lib/pubsub');
  var Section = MsgView.extend({
    _queueRender: true,
    constructor: function() {
      Section.__super__.constructor.apply(this, arguments);
      var self = this;
      bus.subscribe('loadManagerEnd', function(name, data) {
        self.data.user = data.user;
        self.data.business = data.business;
        self.data.location = data.location;
        self.render(data);
      });
      this._subscribe();
    },
    hide: function() {
      this.visible = false;
      this.$el.hide();
    },
    render: function() {
      if(!this.visible) return this._queueRender = true;
      this._queueRender = false;
      Section.__super__.render.apply(this, arguments);
    },
    show: function() {
      this.visible = true;
      if(this._queueRender) {
        this.render();
      }
      this.$el.show();
    }
  });
  return Section;
});
