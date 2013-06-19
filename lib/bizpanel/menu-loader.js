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
    loadMenuSections: function(businessId, cb) {
      console.log('loading product categories');
      api.businesses.productCategories.list(businessId, cb);
    },
    //load all tags for business
    loadTags: function(businessId, cb) {
      console.log('loading business tags');
      api.productTags.list({businessId: businessId}, cb);
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
    createCategory: function(category, cb) {
      console.log('create', category, cb);
      var data = {
        name: category.name,
        description: category.description,
        order: category.order
      };
      api.businesses.productCategories.create(this.businessId, data, cb);
    },
    updateCategory: function(category, cb) {
      console.log('update', category, cb);
      var data = {
        name: category.name,
        description: category.description,
        order: category.order
      };
      api.businesses.productCategories.update(this.businessId, category.id, data, cb);
    },
    deleteCategory: function(category, cb) {
      console.log('delete', category, cb);
    },
    processDiff: function(diff, cb) {
      console.log(diff.action);
      console.log(this.businessId);
      this[diff.action + 'Category'](diff.record, cb);
    },
    processMenuSectionUpdates: function(diffs) {
      if(diffs.length) {
        troller.spinner.spin();
        async.forEach(diffs, this.processDiff.bind(this), function(err, res) {
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
          sections: [],
          tags: []
        };
        //load all products for this business
        this.loadProducts(msg.businessId, function(err, result) {
          console.log('loaded products');
          self.result.products = result;
          self.loadMenuSections(msg.businessId, function(err, result) {
            console.log('loaded menu sections');
            self.result.sections = result;
            self.loadTags(msg.businessId, function(err, result) {
              console.log('loaded tags');
              self.result.tags = result;
              self.publish('loadMenuEnd', self.result);
            });
          });
        });
      },
      //resolves differences between sections
      //and does CRUD on each one that changed
      saveSectionChangesBegin: function(msg) {
        var diffs = this.getSectionDiffs(msg.oldSections, msg.newSections);
        this.processMenuSectionUpdates(diffs);
      },
      saveProductBegin: function(product) {
        console.log('would save product', product);
        troller.spinner.spin();
        setTimeout(function() {
          troller.spinner.stop();
          this.publish('saveProductEnd');
        }.bind(this), 1000);
      }
    }
  });
});
