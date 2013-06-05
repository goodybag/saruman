define(function(require) {
  var login = require('../page-login');
  var bus = require('../../lib/pubsub');
  var utils = require('../../lib/utils');
  var index = require('./index');
  var user = require('../../models/user')
  var api = require('../../lib/api');

  var templates = {
    layout: require('hbt!../../templates/bizpanel/layout'),
    nav: require('hbt!../../templates/bizpanel/nav')
  };

  var MsgView = utils.View.extend({
    constructor: function() {
      utils.View.prototype.constructor.apply(this, arguments);
      this._subscribe();
    },
    _subscribe: function() {
      for(var key in this.subscribe) {
        var event = function(name, message) {
          this.subscribe[key].call(this, message);
        }.bind(this);
        bus.subscribe(key, event);
      }
    },
    render: function(data) {
      this.$el.html(this.template(data || {}));
    }
  });

  var Section = MsgView.extend({
    hide: function() {
      this.$el.hide();
    },
    show: function() {
      if(!this.rendered) {
        this.render();
      }
      this.$el.show();
    }
  });

  var index = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/index'),
    url: '#panel/index',
    text: 'Business Info'
  }));

  var menu = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/menu'),
    url: '#panel/menu',
    text: 'Edit Menu'
  }));

  var tablet = new (Section.extend({
      template: require('hbt!../../templates/bizpanel/tablet'),
      url: '#panel/tablet',
      text: 'Manage Tablet'
  }));

  var messages = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/messages'),
    url: '#panel/messages',
    text: 'Customer Messaging'
  }));

  var contact = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/contact'),
    url: '#panel/contact',
    text: 'Contact Us'
  }));


  var sections = {
    index: index,
    menu: menu,
    tablet: tablet,
    messages: messages,
    contact: contact
  };

  var getNavViewData = function(name) {
    section = section || 'index';
    var data = [];
    for(var key in sections) {
      var section = sections[key];
      section.active = (key == name);
      data.push(section);
    }
    return data;
  };

  var Header = MsgView.extend({
    template: require("hbt!../../templates/bizpanel/header"),
    subscribe: {
      loadManagerBegin: function() {
        this.render();
      },
      loadManagerEnd: function(manager) {
        this.render(manager);
      }
    }
  });

  var BizPanelAppView = function() {
    //attach the layout to the body
    var layout = $(templates.layout());
    //disable click on msg components
    layout.on('click', '.msg', function() {
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
