define(function(require) {
  var login = require('../page-login');
  var bus = require('../../lib/pubsub');
  var utils = require('../../lib/utils');
  var user = require('../../models/user')
  var api = require('../../lib/api');

  var templates = {
    layout: require('hbt!../../templates/bizpanel/layout'),
    nav: require('hbt!../../templates/bizpanel/nav')
  };

  var MsgView = utils.View.extend({
    data: {},
    constructor: function() {
      MsgView.__super__.constructor.apply(this, arguments);
      //utils.View.prototype.constructor.apply(this, arguments);
      this._subscribe();
    },
    _subscribe: function() {
      var self = this;
      _.each(this.subscribe, function(value, key) {
        var event = function(name, message) {
          this.subscribe[key].call(this, message);
        }.bind(self);
        console.log('subscribing to', key)
        bus.subscribe(key, event);
      });
    },
    render: function(data) {
      var view = _.extend((this.data||{}), data||{});
      this.$el.html(this.template(view));
    }
  });

  var Section = MsgView.extend({
    _queueRender: true,
    hide: function() {
      this.visible = false;
      this.$el.hide();
    },
    render: function() {
      if(!this.visible) return this._queueRender = true;
      this._queueRender = false;
      console.log('rendering ' + this.text);
      Section.__super__.render.apply(this, arguments);
    },
    show: function() {
      this.visible = true;
      if(this._queueRender) {
        this.render();
      }
      this.$el.show();
    },
    subscribe: {
      loadManagerEnd: function(manager) {
        this.data.manager = manager;
        this.data.business = manager.business;
        this.data.location = manager.location;
        this.render();
      }
    }
  });

  var dashboard = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/dashboard'),
    url: '#panel/dashboard',
    text: 'Dashboard'
  }));

  var menu = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/menu'),
    url: '#panel/menu',
    text: 'Menu Items'
  }));

  var tablet = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/tablet'),
    url: '#panel/tablet',
    text: 'Tablet Gallery'
  }));

  var messages = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/messages'),
    url: '#panel/messages',
    text: 'Messaging'
  }));

  var contact = new (Section.extend({
    template: require('hbt!../../templates/bizpanel/contact'),
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


  var sections = {
    dashboard: dashboard,
    menu: menu,
    tablet: tablet,
    messages: messages,
    contact: contact
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
