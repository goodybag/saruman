define(function(require) {
  var Section = require('../section');
  var bus = require('../../../lib/pubsub');
  var Editor = require('../../../components/hours-editor/component');
  var dashboard = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/dashboard'),
    editTpl:require('hbt!../../../templates/page-business-details-location-edit'),
    icon: 'home',
    url: '#panel/dashboard',
    text: 'Dashboard',
    events: {
      //'click .form-actions > .cancel': 'onFormCancel'
    },
    initialize: function() {
      console.log('init dashboard')
      this.editor = new Editor();
    },
    render: function(data) {
      data = data || this.data;
      this.$el.html(this.template(this.data||{}))
      this.$el.addClass('location-edit')
      var modalBody = $('#editLocationModal .modal-body');
      modalBody.html(this.editTpl(this.data.location || {}))
      if(data && data.location) {
        this.editor.render(data.location);
        modalBody.find('#hours-edit-container').append(this.editor.$el);
        this.editor.delegateEvents();
      }
    },
    subscribe: {
      editLocation: function() {
        console.log('showing location edit')
        $('#editLocationModal').modal()
          .css({width: '60%', left: '20%', marginLeft: 'auto', marginRight: 'auto'})
          .find('.modal-body').css({height: '400px'});
      },
      saveLocationEdits: function() {
        var el = this.$el.find('#editLocationModal .modal-body form');
        //apply new values to location
        var val = function(id) {
          return el.find('#location-' + id + '-input').val();
        };
        var location = this.data.location;
        var toSave = {
          street1: val('street1'),
          street2: val('street2'),
          city: val('city'),
          zip: val('zip'),
          phone: val('phone')
        };
        var hours = this.editor.getValues();
        console.log(hours);
        _.extend(toSave, hours);
        var msg = {
          locationId: location.id,
          data: toSave
        };
        bus.publish('saveLocation', msg);
      },
      saveLocationEnd: function() {
        //$('#editLocationModal').modal('hide');
      }
    }
  }));
  return dashboard;
});
