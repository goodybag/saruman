define(function(require) {
  var subscribe = require('./subscribe');
  var utils = require('../utils');
  var bus = require('../pubsub');
  var api = require('../api');
  var async = require('async');
  var controller = (function() {
    var ctrl = {
      subscribe: {
        loadManagerBegin: function(msg) {
          var user = msg;
          var self = this;
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
        },
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

  return controller;

})
