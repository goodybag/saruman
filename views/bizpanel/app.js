define(function(require) {
  var login = require('../page-login');
  var bus = require('../../lib/pubsub');
  var utils = require('../../lib/utils');
  var user = require('../../models/user')
  var api = require('../../lib/api');
  var Section = require('./section');
  var Header = require('./header');

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
      data.push(section);
    }
    return data;
  };

  var BizPanelAppView = function() {
    //attach the layout to the body
    var layout = $(templates.layout());
    //disable click on msg components
    layout.on('click', '.msg', function() {
      var el = $(this);
      var msgName = el.data('msgName');
      if(msgName) {
        console.log('publishing', msgName);
        bus.publish(msgName);
      }
      return false;
    });
    $(document.body).html(layout);
    $('#bizpanel-nav').html(templates.nav({nav: getNavViewData()}));
    $('#bizpanel').hide();
    var contentPanel = $('#bizpanel-content');
    for(var key in sections) {
      contentPanel.append(sections[key].$el);
    }
    this.loginView = new login();
    this.header = new Header();
    $('#bizpanel-header').html(this.header.$el)
    user.on('auth', this._onUserAuth.bind(this, user));
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

  BizPanelAppView.prototype.changePage = function(page, options) {
    console.log('BizPanelAppView.changePage', page, options);
    if(page == 'login') {
      $('#bizpanel').hide();
      this.loginView.render();
      this.loginView.show();
      $(document.body).append(this.loginView.$el);
    } else {
      $('#bizpanel').show();
      this.loginView.hide();
      renderContent(page);
    } 
  };

  //load businesses and locations for manager
  BizPanelAppView.prototype._onUserAuth = function(user) {
    var self = this;
    bus.publish('loadManagerBegin');
    api.managers.get(user.id, function(err, manager) {
      api.businesses.get(manager.businessId, function(err, business) {
        api.locations.get(manager.locationId, function(err, location) {
          var manager = {
            user: user.attributes,
            business: business,
            location: location
          };
          bus.publish('loadManagerEnd', manager);
        })
      })
    })
  };

  return BizPanelAppView;
});
