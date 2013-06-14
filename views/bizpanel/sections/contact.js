define(function(require) {
  var Section = require('../section');
  var bus = require('../../../lib/pubsub');
  var utils = require('../../../lib/utils');
  var api = require('../../../lib/api');
  var contact = new (Section.extend({
    template: require('hbt!../../../templates/bizpanel/contact'),
    url: '#panel/contact',
    icon: 'envelope',
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
    sendRequestMail: function(requestType, callback) {
      var subject = 'BizPanel - ' + requestType + ' Request';
      var body = subject + ' requested by ' + this.data.user.email + ' for business ' + this.data.business.name + ' at location ' + this.data.location.street1;
      var email = {
        from: 'brian@goodybag.com',
        subject: subject,
        body: body
      };
      api.email.send(email, callback);
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
        //cheaply validate form
        if(!(form.name && form.from && form.subject && form.message)) {
          return this.getContactForm().find('.alert').closest('.row').removeClass('hidden');
        } else {
          this.getContactForm().find('.alert').closest('.row').addClass('hidden');
        }
        var mail = {
          from: form.from,
          subject: form.subject,
          body: form.message
        };
        mail.body += '<br /><br />Sent from BizPanel by ' + this.data.user.email + '.<br />  Business: ' + this.data.business.name + ' - ' + this.data.location.street1 + ' ' + this.data.zip;
        if(form.copySender) {
          mail.cc = mail.from;
        }
        bus.publish('sendContactMessageBegin', mail);
      },
      //click event
      requestManager: function() {
        bus.publish('requestManagerBegin');
        this.setProgress('#request-manager-status');
        this.sendRequestMail('Account Manager', function(err) {
          if(err) console.error(err);
          bus.publish('requestManagerEnd');
        });
      },
      requestManagerEnd: function() {
        this.setEnd('#request-manager-status');
      },
      //click event
      requestKeytags: function() {
        this.setProgress('#request-keytags-status')
        bus.publish('requestKeytagsBegin');
        this.sendRequestMail('Keytags', function(err) {
          if(err) console.error(err);
          bus.publish('requestKeytagsEnd');
        });
      },
      requestKeytagsEnd: function() {
        this.setEnd('#request-keytags-status');
      },
      sendContactMessageBegin: function(mail) {
        this.showSendingNotification();
        api.email.send(mail, function(err, res) {
          bus.publish('sendContactMessageEnd')
          if(err) {
            bus.publish('sendContactMessageError');
            console.log(err);
            //validation failed
            if(err.code == "0201") {
            }
          }
        });
      },
      sendContactMessageEnd: function() {
        this.showSentNotification();
      },
      loadManagerEnd: function(data) {
        this.data = data;
        console.log(this.data);
        this.render();
      }
    }
  }));
  return contact;
})
