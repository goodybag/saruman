define(function(require) {
  var api = require('../api');
  var troller = require('../troller');
  var async = require('async');
  var utils = require('../utils');
  var subscribe = require('./subscribe');
  return subscribe({
    loadProducts: function(businessId, cb) {
      var self = this;
      var params = {
        limit: 1000,
        include: ['categories', 'tags']
      };
      api.businesses.products.list(businessId, params, cb);
    },
    loadMenuSections: function(locationId, cb) {
      console.log('loading menu sections');
      var params = {
        limit: 1000,
        include: ['products']
      };
      utils.api.get('v1/locations/' + locationId + '/menu-sections', params, cb);
    },
    //calculate diffs between old and new sections
    //and return diff objects used to fire off
    //CRUD requests.  This is broken out into its own
    //function so that it's testable
    getSectionDiffs: function(oldSections, newSections) {
      console.log('old sections', oldSections)
      console.log('new sections', newSections)
      var diffs = [];
      //find creates & updates
      for(var i = 0; i < newSections.length; i++) {
        var newSection = newSections[i];
        var old = _.findWhere(oldSections, {id: newSection.id });
        var record = {
          name: newSection.name,
          description: newSection.description,
          order: newSection.order
        };
        if(!old) {
          //old doesn't exist - create
          diffs.push({
            action: 'create',
            record: record
          });
        } else {
          record.id = old.id;
          if(record.name != old.name || record.description != old.description || record.order != old.order) {
            diffs.push({
              action: 'update',
              record: record
            });
          }
        }
      }
      //find deletes
      for(var i = 0; i < oldSections.length; i++) {
        var old = oldSections[i];
        if(!_.findWhere(newSections, {id: old.id})) {
          console.log('delete', old)
          diffs.push({
            action: 'delete',
            record: old
          });
        }
      }
      return diffs;
    },
    processDiff: function(diff, cb) {
      console.log(diff.action);
      setTimeout(cb, 1000)
    },
    processMenuSectionUpdates: function(diffs) {
      if(diffs.length) {
        troller.spinner.spin();
        async.forEach(diffs, this.processDiff, function(err, res) {
          this.publish('loadMenuBegin', {
            businessId: this.businessId,
            locationId: this.locationId
          })
          troller.spinner.stop();
        }.bind(this))
      }
    },
    subscribe: {
      //expects {businessId, locationId}
      loadMenuBegin: function(msg) {
        this.businessId = msg.businessId;
        this.locationId = msg.locationId;
        var self = this;
        self.result = {
          products: [],
          sections: []
        };
        //load all products for this business
        this.loadProducts(msg.businessId, function(err, result) {
          console.log('loaded products');
          self.result.products = result;
          self.loadMenuSections(msg.locationId, function(err, result) {
            console.log('loaded menu sections');
            self.result.sections = result;
            self.publish('loadMenuEnd', self.result);
          });
        });
      },
      //resolves differences between sections
      //and does CRUD on each one that changed
      saveSectionChangesBegin: function(msg) {
        var diffs = this.getSectionDiffs(msg.oldSections, msg.newSections);
        this.processMenuSectionUpdates(diffs);
      }
    }
  });
});
