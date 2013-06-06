//a base class for each main 'section' of the bizpanel
//a 'section' corresponds to something on the left-hand nav
define(function(require) {
  var MsgView = require('./msg-view');
  var Section = MsgView.extend({
    _queueRender: true,
    hide: function() {
      this.visible = false;
      this.$el.hide();
    },
    render: function() {
      if(!this.visible) return this._queueRender = true;
      this._queueRender = false;
      console.log('rendering ' + this.text);
      Section.__super__.render.apply(this, arguments);
    },
    show: function() {
      this.visible = true;
      if(this._queueRender) {
        this.render();
      }
      this.$el.show();
    },
    subscribe: {
      loadManagerEnd: function(data) {
        this.data.user = data.user;
        this.data.business = data.business;
        this.data.location = data.location;
        this.render();
      }
    }
  });
  return Section;
});
