define(function(require) {
  var Section = require('../section');
  var template = require('hbt!../../../templates/bizpanel/settings');
  return new (Section.extend({
    inNav: false,
    template: template,
    events: {
      'keyup input': 'onInputKeyUp'
    },
    isPasswordFormValid: function(values) {
      var formKindOfValid = values.newPassword.length > 1 && values.newPassword == values.confirmPassword;
      return formKindOfValid;
    },
    onInputKeyUp: function() {
      var values = this.getValues();
      var formKindOfValid = this.isPasswordFormValid(values);
      this.$el.find('form button').toggleClass('disabled', !formKindOfValid);
    },
    render: function() {
      this.$el.html(this.template({}));
    },
    getValues: function() {
      this.$oldPassword = this.$oldPassword || this.$el.find('#settings-old-password');
      this.$newPassword = this.$newPassword || this.$el.find('#settings-new-password');
      this.$confirmPassword = this.$confirmPassword || this.$el.find('#settings-confirm-password');
      var values = {
        newPassword: this.$newPassword.val(),
        confirmPassword: this.$confirmPassword.val()
      };
      return values;
    },
    subscribe: {
      changePassword: function() {
        var values = this.getValues();
        if(!this.isPasswordFormValid(values)) return;
        this.publish('changePasswordBegin', { password: values.newPassword });
      },
      changePasswordBegin: function() {
        this.$el.find('form button').hide();
      },
      changePasswordEnd: function() {
        this.$newPassword.val('');
        this.$confirmPassword.val('');
        this.$el.find('form button').show().addClass('disabled');
      }
    }
  }));
});
