define(function(require) {
  var
    utils     = require('../utils')
  , config    = require('../../config')
  , troller   = require('../troller')
  , bus = require('../pubsub')
  , subscribe = require('./subscribe')
  ;

  var user = require('../../models/user')
  var section = function(name) {
    return function() {
      bus.publish('showSection', {section: name});
    }
  };

  var config = {
    initialize: function() {
      subscribe(this);
    },
    routes: {
      "logout": "logout",
      "login": "showLogin"
    },
    showLogin: function(){
      bus.publish('showLogin');
    },
    logout: function(){
      bus.publish('logout');
    },
    subscribe: {
      showLogin: function() {
        this.navigate('login');
      },
      showSection: function(msg) {
        this.navigate(msg.section);
      }
    }
  };
  ['dashboard', 'menu', 'tablet', 'messages', 'contact'].forEach(function(sectionName) {
    config.routes[sectionName] = sectionName;
    config[sectionName] = section(sectionName);
  });

  return utils.Router.extend(config);
})
