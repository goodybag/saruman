define(function(require) {
  var login = require('../page-login');
  var bus = require('../../lib/pubsub');
  var utils = require('../../lib/utils');
  var user = require('../../models/user')
  var api = require('../../lib/api');
  var troller = require('../../lib/troller');
  var Header = require('./header');

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

    var self = ctrl;
    _.each(self.subscribe, function(value, key) {
      var event = function(name, message) {
        self.subscribe[key].call(self, message);
      };
      console.log('subscribing to', key)
      bus.subscribe(key, event);
    });
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
        bus.publish(msgName, el.data());
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
    bus.subscribe('changeLocation', this._onChangeLocation.bind(this));
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

  //load all the initial data for the application
  BizPanelAppView.prototype._onUserAuth = function(user) {
    var self = this;
    bus.publish('loadManagerBegin');
    api.managers.get(user.id, function(err, manager) {
      api.businesses.get(manager.businessId, function(err, business) {
        api.businesses.loyalty.get(manager.businessId, function(err, loyalty) {
          business.loyalty = loyalty;
          api.businesses.locations.list(manager.businessId, function(err, locations) {
            business.locations = locations;
            location.active = true;
            var data = {
              user: user.attributes,
              business: business,
              location: location
            };
            data.multipleLocations = (locations.length > 1);
            self.data = data;
            console.log('loaded', self.data);
            bus.publish('changeLocation', {locationId: manager.locationId || locations[0].id});
          })
        })
      })
    })
  };

  BizPanelAppView.prototype._onChangeLocation = function(name, msg) {
    for(var i = 0; i < this.data.business.locations.length; i++) {
      var location = this.data.business.locations[i];
      location.active = false;
      if(location.id === msg.locationId) {
        location.active = true;
        this.data.location = location;
      }
    }
    bus.publish('loadManagerEnd', this.data);
  };

  return BizPanelAppView;
});
