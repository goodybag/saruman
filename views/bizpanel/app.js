define(function(require) {
  var login = require('../page-login');
  var index = require('./index');

  var templates = {
    layout: require('hbt!../../templates/bizpanel/layout'),
    nav: require('hbt!../../templates/bizpanel/nav')
  };

  var sections = {
    index: {
      template: require('hbt!../../templates/bizpanel/index'),
      url: '#panel/index',
      text: 'Business Info',
      active: true
    },
    menu: {
      template: require('hbt!../../templates/bizpanel/menu'),
      url: '#panel/menu',
      text: 'Edit Menu'
    },
    tablet: {
      template: require('hbt!../../templates/bizpanel/tablet'),
      url: '#panel/tablet',
      text: 'Manage Tablet'
    },
    messages: {
      template: require('hbt!../../templates/bizpanel/messages'),
      url: '#panel/messages',
      text: 'Customer Messaging'
    },
    contact: {
      template: require('hbt!../../templates/bizpanel/contact'),
      url: '#panel/contact',
      text: 'Contact Us'
    }
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
  }

  var BizPanelAppView = function() {
    $(document.body).html(templates.layout());
    $('#bizpanel-nav').html(templates.nav({nav: getNavViewData()}));
  };

  var renderContent = function(name, viewData) {
    var contentTemplate = (sections[name]||0).template;
    if(contentTemplate) {
      $('#bizpanel-content').html(contentTemplate(viewData))
      $('#bizpanel-nav').html(templates.nav({nav: getNavViewData(name)}));
    } else {
      console.error('No template found:', name)
    }
  };

  BizPanelAppView.prototype.changePage = function(page, options) {
    console.log('BizPanelAppView.changePage', page, options);
    if(page == 'login') {
      var view = new login();
      view.render();
      $(document.body).html(view.$el);
    } else {
      renderContent(page);
    } 
  };

  return BizPanelAppView;
});
