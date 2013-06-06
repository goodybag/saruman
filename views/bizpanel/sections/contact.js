define(function(require) {
  var Section = require('../section');
  var bus = require('../../../lib/pubsub');
  var utils = require('../../../lib/utils');
  var contact = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/contact'),
    url: '#panel/contact',
    text: 'Contact Us',
    getContactForm: function() {
      return this.$el.find('form#contact');
    },
    getSendingTextEl: function() {
      return this.getContactForm().find('button').next();
    },
    getSendingButton: function() {
      return this.getContactForm().find('button');
    },
    getFormControls: function() {
      return this.getContactForm().find('input').add('textarea');
    },
    //true turns controls ON - false turns them off
    toggleFormControls: function(on) {
      return this.getFormControls().attr('readonly', !on);
    },
    showSendingNotification: function() {
      this.getSendingButton().hide();
      this.toggleFormControls(false);
      this.setProgress(this.getSendingTextEl());
    },
    showSentNotification: function() {
      this.setEnd(this.getSendingTextEl(), this.render.bind(this));
    },
    setProgress: function(el) {
      el = $(el);
      el.text(el.data('progressText')).show();
    },
    setEnd: function(el, cb) {
      el = $(el);
      el.text(el.data('endText'));
      setTimeout(function() {
        el.fadeOut(cb || utils.noop);
      }, 1000);
    },
    subscribe: {
      //when the button is clicked - this could be moved to an event listener
      //since it still concerns itself solely with the enclosed view
      sendContactMessage: function() {
        //verify the form is valid
        var values = this.getContactForm().serializeArray();
        var form = {};
        _.forEach(values, function(val) {
          form[val.name] = val.value;
        });
        form.copySender = !!form.copySender;
        console.log(form);
        //cheaply validate form
        if(!(form.name && form.from && form.subject && form.message)) {
          return this.getContactForm().find('.alert').closest('.row').removeClass('hidden');
        } else {
          this.getContactForm().find('.alert').closest('.row').addClass('hidden');
        }
        bus.publish('sendContactMessageBegin', form);
      },
      //click event
      requestManager: function() {
        bus.publish('requestManagerBegin');
        this.setProgress('#request-manager-status');
        setTimeout(function() {
          bus.publish('requestManagerEnd');
        }, 1000);
      },
      requestManagerEnd: function() {
        this.setEnd('#request-manager-status');
      },
      //click event
      requestKeytags: function() {
        this.setProgress('#request-keytags-status')
        bus.publish('requestKeytagsBegin');
        setTimeout(function() {
          bus.publish('requestKeytagsEnd');
        }, 1000);
      },
      requestKeytagsEnd: function() {
        this.setEnd('#request-keytags-status');
      },
      sendContactMessageBegin: function(messgage) {
        console.log('TODO', 'send contact message to server');
        this.showSendingNotification();
        setTimeout(function() {
          bus.publish('sendContactMessageEnd')
        }, 1000);
      },
      sendContactMessageEnd: function() {
        this.showSentNotification();
      },
      loadManagerEnd: function(manager) {
        this.data = manager;
        console.log(this.data);
        this.render();
      }
    }
  }));
  return contact;
})