define(function(require) {
  var async = require('async');
  var login = require('../page-login');
  var bus = require('../../lib/pubsub');
  var utils = require('../../lib/utils');
  var user = require('../../models/user')
  var troller = require('../../lib/troller');
  var Header = require('./header');
  var subscribe = require('../../lib/bizpanel/subscribe');
  var loader = require('../../lib/bizpanel/data-loader');

  var templates = {
    layout: require('hbt!../../templates/bizpanel/layout'),
    nav: require('hbt!../../templates/bizpanel/nav')
  };

  var sections = {
    dashboard: require('./sections/dashboard'),
    menu: require('./sections/menu'),
    tablet: require('./sections/tablet'),
    messages: require('./sections/messages'),
    contact: require('./sections/contact')
  };

  var getNavViewData = function(name) {
    section = section || 'dashboard';
    var data = [];
    for(var key in sections) {
      var section = sections[key];
      section.active = (key == name);
      section.name = key;
      data.push(section);
    }
    return data;
  };


  var BizPanelAppView = function() {
    subscribe(this);
    this.section = 'dashboard';
    //attach the layout to the body
    var layout = this.layout = $(templates.layout());
    //disable click on msg components
    $(document.body).on('click', '.msg', function() {
      var el = $(this);
      var msgName = el.data('msgName');
      if(msgName) {
        console.log('publishing', msgName);
        bus.publish(msgName, el.data());
      }
      return false;
    });
    //capture select on msg components
    $(document.body).on('change', 'select.msg', function() {
      var $el = $(this);
      var msgName = $el.data('msgName');
      if(msgName) {
        console.log('publishing', msgName);
        var data = $el.data();
        data.value = $el.val();
        bus.publish(msgName, data);
      }
      return false;
    });
    $(document.body).html(layout);
    $('#bizpanel-nav').html(templates.nav({nav: getNavViewData()}));
    $('#bizpanel').hide();
    var contentPanel = this.contentPanel = $('#bizpanel-content');
    for(var key in sections) {
      contentPanel.append(sections[key].$el);
    }
    this.loginView = new login();
    this.header = new Header();
    $('#bizpanel-header').html(this.header.$el)

    //ensure user is logged in
    user.on('auth', this._onUserAuth.bind(this, user));
    user.isLoggedIn(function(err, loggedIn) {
      if(err) return alert('error getting log in information');
      if(loggedIn) {
      } else {
        bus.publish('showLogin');
      }
    });

  };

  var renderContent = function(name, viewData) {
    var contentTemplate = (sections[name]||0).template;
    if(contentTemplate) {
      $('#bizpanel-nav').html(templates.nav({nav: getNavViewData(name)}));
      for(var key in sections) {
        sections[key][key == name ? 'show' : 'hide']();
      }
    } else {
      console.error('No template found:', name)
    }
  };

  //implement app.js interface
  BizPanelAppView.prototype.changePage = function(page, options) {
    return;
  };

  //load all the initial data for the application
  BizPanelAppView.prototype._onUserAuth = function(user) {
    console.log('onuserauth')
    troller.spinner.spin();
    //hide layout until load is completed
    bus.publish('loadManagerBegin', user);
  };

  BizPanelAppView.prototype.subscribe = {
    showSection: function(msg) {
      if(!msg.section) return;
      this.section = msg.section;
      user.isLoggedIn(function(err, loggedIn) {
        if(!loggedIn) {
          console.log('try to show', msg.section, 'but not logged in');
          return this.publish('showLogin');
        }
        console.log('would show section', msg.section);
        $('#bizpanel').show();
        this.loginView.hide();
        renderContent(msg.section || 'dashboard');
      }.bind(this));
    },
    loadManagerBegin: function() {
    },
    loadManagerEnd: function(msg) {
      troller.spinner.stop();
      this.data = msg;
    },
    logout: function() {
      user.logout(function(err, res) {
        this.publish('showLogin')
      }.bind(this));
    },
    showLogin: function() {
      user.isLoggedIn(function(err, loggedIn) {
        if(loggedIn) {
          return this.publish('showSection', {section: this.section});
        }
        $('#bizpanel').hide();
        this.loginView.render();
        this.loginView.show();
        $(document.body).append(this.loginView.$el);
      }.bind(this));
    },
    forgotPassword: function() {
      $("#forgotPasswordModal").modal();
    },
    sendForgotPasswordEmailBegin: function(msg) {
      var email = $("#resetEmail").val();
      if(!email) return;
      troller.spinner.spin();
      utils.api.post('v1/users/password-reset', {email: email}, function(err, res) {
        troller.spinner.stop();
        $("#forgotPasswordModal").modal('hide');
      });
    }
  };

  return BizPanelAppView;
});
