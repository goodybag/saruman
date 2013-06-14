define(function(require) {
  var Section = require('../section');
  var bus = require('../../../lib/pubsub');
  var Editor = require('../../../components/hours-editor/component');
  var tpl = require()
  var BusinessEditor = require('../../../views/page-business-details-main');
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
      this.businessEditor = new BusinessEditor();
      var self = this;
      this.businessEditor.doSuccessThing = function() {
        self.render();
      }
    },
    render: function(data) {
      data = data || this.data;
      this.$el.html(this.template(this.data||{}))
      this.$el.addClass('location-edit')
      var editHtml = this.editTpl(this.data.location || {});
      this.$el.find('#location-edit-container').html(editHtml);
      this.$el.find('#business-edit-container').html(this.businessEditor.render().$el)
      this.businessEditor.delegateEvents();
      if(data && data.location) {
        this.editor.render(data.location);
        this.$el.find('#hours-edit-container').append(this.editor.$el);
        this.editor.delegateEvents();
      }
      if(data && data.business) {
        this.businessEditor.business = data.business;
      }
    },
    subscribe: {
      editBusiness: function() {
        $('#dashboard-view').hide();
        $('#business-edit').show();
      },
      editBusinessCancel: function() {
        $('#dashboard-view').show();
        $('#business-edit').hide();
      },
      editLocation: function() {
        $('#dashboard-view').hide();
        $('#location-edit').show();
      },
      editLocationCancel: function() {
        $('#dashboard-view').show();
        $('#location-edit').hide();
      },
      saveLocationEdits: function() {
        var el = this.$el.find('#location-edit form');
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
