define(function(require) {
  var utils  = require('../utils');
  var config = require('../../config');
  return {
    //{to: , from:, subject:, body: }
    send: function(message, callback) {
      console.log(message);
      message.to = message.to || config.contactEmail;
      utils.api.post('v1/email', message, callback);
    }
  }
});
