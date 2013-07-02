define(function(require) {
  var async = require('async');
  var login = require('../page-login');
  var bus = require('../../lib/pubsub');
  var utils = require('../../lib/utils');
  var user = require('../../models/user')
  var api = require('../../lib/api');
  var troller = require('../../lib/troller');
  var Header = require('./header');
  var subscribe = require('../../lib/bizpanel/subscribe');

  var controller = (function() {
    var ctrl = {
      subscribe: {
        loadManagerEnd: function(data) {
          this.data = data;
          var self = this;
          if(self.data.business.measures && self.data.location.measures) return;
          var loadBusinessMeasures = function(cb) {
            if(self.data.business.measures) return cb();
            console.log('loading measures for business', self.data.business.id);
            utils.api.get('v1/businesses/' + data.business.id + '/measures', function(err, res) {
              if(err) return console.error('unable to load measures for business'), cb(err);
              self.data.business.measures = res;
              cb();
            });
          };
          var loadLocationMeasures = function(cb) {
            if(self.data.location.measures) return console.log('skpping location measures'), cb();
            console.log('loading location measures', self.data.location.id);
            utils.api.get('v1/locations/' + self.data.location.id + '/measures', function(err, res) {
              if(err) return console.error('could not load measures for location'), cb(err);
              self.data.location.measures = res;
              return cb();
            });
          };
          loadBusinessMeasures(function(err) {
            if(err) return;
            loadLocationMeasures(function(err) {
              if(err) return;
              bus.publish('loadManagerEnd', self.data);
            });
          });
        },
        saveLocation: function(msg) {
          bus.publish('saveLocationBegin');
          troller.spinner.spin();
          api.locations.update(msg.locationId, msg.data, function(err, result) {
            if(err) {
              bus.publish('saveLocationError', err);
              return troller.spinner.stop();
            }
            api.locations.get(msg.locationId, function(err, result) {
              if(err) {
                bus.publish('saveLocationError', err);
                return troller.spinner.stop();
              }
              self.data.location = result;
              troller.spinner.stop();
              //self.data.location = location;
              bus.publish('saveLocationEnd', self.data.location);
              bus.publish('loadManagerEnd', self.data);
            });
          });
        },
      }
    };
    return subscribe(ctrl)
  })();

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
    user.isLoggedIn(function(err, loggedIn) {
      console.log(JSON.stringify(err));
      if(err) return alert('error getting log in information');
      if(loggedIn) {
      } else {
        bus.publish('showLogin');
      }
    });

    //attach the layout to the body
    var layout = this.layout = $(templates.layout());
    //disable click on msg components
    layout.on('click', '.msg', function() {
      var el = $(this);
      var msgName = el.data('msgName');
      if(msgName) {
        console.log('publishing', msgName);
        bus.publish(msgName, el.data());
      }
      return false;
    });
    //capture select on msg components
    layout.on('change', 'select.msg', function() {
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

  //implement app.js interface
  BizPanelAppView.prototype.changePage = function(page, options) {
    return;
  };

  //load all the initial data for the application
  BizPanelAppView.prototype._onUserAuth = function(user) {
    console.log('onuserauth')
    troller.spinner.spin();
    //hide layout until load is completed
    this.layout.children().first().next().hide();
    var self = this;
    bus.publish('loadManagerBegin');
    api.managers.get(user.id, function(err, manager) {
      var actions = {
        business: function(cb) {
          api.businesses.get(manager.businessId, cb);
        },
        loyalty: function(cb) {
          api.businesses.loyalty.get(manager.businessId, cb);
        },
        locations: function(cb) {
          api.businesses.locations.list(manager.businessId, cb);
        }
      };

      return async.parallel(actions, function(err, result) {
        troller.spinner.stop();
        self.layout.children().first().next().show();
        if(err) return alert('error loading business information');
        var business = result.business[0];
        business.loyalty = result.loyalty[0];
        var locations = business.locations = result.locations[0];
        var data = {
          user: user.attributes,
          business: business,
          location: null
        };
        data.multipleLocations = (locations.length > 1);
        self.data = data;
        bus.publish('showSection', {section: self.section});
        console.log('loaded', self.data);
        bus.publish('changeLocation', {locationId: manager.locationId || locations[0].id});
      });

    });
  };

  BizPanelAppView.prototype.subscribe = {
    showSection: function(msg) {
      this.section = msg.section;
      user.isLoggedIn(function(err, loggedIn) {
        if(!loggedIn) {
          console.log('try to show', msg.section, 'but not logged in');
          return this.publish('showLogin');
        }
        console.log('would show section', msg.section);
        $('#bizpanel').show();
        this.loginView.hide();
        renderContent(msg.section);
      }.bind(this));
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
    changeLocation: function(msg) {
      for(var i = 0; i < this.data.business.locations.length; i++) {
        var location = this.data.business.locations[i];
        location.active = false;
        if(location.id === msg.locationId) {
          location.active = true;
          this.data.location = location;
        }
      }
      bus.publish('loadManagerEnd', this.data);
    }
  };

  return BizPanelAppView;
});
