define(function(require) {
  var Section = require('../section');
  var dashboard = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/dashboard'),
    editTpl:require('hbt!../../../templates/page-business-details-location-edit'),
    icon: 'home',
    url: '#panel/dashboard',
    text: 'Dashboard',
    events: {
      'submit #location-details-form': 'onFormSubmit'//,
      //'click .form-actions > .cancel': 'onFormCancel'
    },
    render: function(data) {
      this.$el.html(this.template(this.data||{}))
      $('#editLocationModal .modal-body').html(this.editTpl(this.data.location || {}))
      this.$el.addClass('location-edit')
    },
    onFormSubmit: function() {
      console.log('on form submit');
    },
    subscribe: {
      editLocation: function() {
        $('#editLocationModal').modal()
        .css({width: '80%', left: '10%', marginLeft: 'auto', marginRight: 'auto'})
        .find('.modal-body').css({height: '500px'});
      }
    }
  }));
  return dashboard;
});
