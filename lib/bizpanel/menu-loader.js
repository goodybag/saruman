define(function(require) {
  var api = require('../api');
  var troller = require('../troller');
  var async = require('async');
  var utils = require('../utils');
  var subscribe = require('./subscribe');
  return subscribe({
    loadProducts: function(locationId, cb) {
      var self = this;
      var url = 'v1/locations/' + locationId + '/products';
      var params = {
        spotlight: true,
        all: true,
        include: ['tags', 'categories'],
        limit: 1000
      };
      //normalize gallery & spotlight sort order
      return utils.api.get(url, params, function(err, products) {
        if(err) return cb(err);
        cb(null, _.filter(products, function(product) {
          return product.isAvailable;
        }));
      });
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
      api.businesses.productCategories.delete(this.businessId, category.id, cb);
    },
    processDiff: function(diff, cb) {
      console.log(diff.action);
      console.log(this.businessId);
      this[diff.action + 'Category'](diff.record, cb);
    },
    processMenuSectionUpdates: function(diffs, cb) {
      if(!diffs.length) {
        return cb();
      }
      if(diffs.length) {
        async.forEach(diffs, this.processDiff.bind(this), cb);
      }
    },
    getOrCreateTagByName: function(tagName, cb) {
      for(var i = 0; i < this.result.tags.length; i++) {
        var tag = this.result.tags[i];
        if(tag.tag.toLowerCase() == tagName.toLowerCase()) return cb(null, tag);
      }
      console.log('creating new tag', tagName);
      api.businesses.productTags.create(this.businessId, {tag: tagName}, cb);
    },
    saveProduct: function(product, cb) {
      //check to see if any product tags are new
      async.map(product.tags, this.getOrCreateTagByName.bind(this), function(err, tags) {
        if(err) return cb(err);
        //copy data we want to save
        var payload = {
          businessId: this.businessId,
          name: product.name,
          price: product.price,
          description: product.description,
          photoUrl: product.photoUrl,
          tags: _.pluck(tags, 'id')
        };
        if(product.categoryId) {
          payload.categories = [product.categoryId];
        } else {
          payload.categories = [];
        }
        console.log('would save product', payload);

        //TODO handle archiving here
        if(product.id) {
          return api.products.update(product.id, payload, cb);
        }
        api.products.create(payload, cb);
      }.bind(this));
    },
    updateProductVisibility: function(id, propertyType) {
      var products = this.result.products;
      var existing = _.findWhere(this.result.products, { id: id });
      var propertyName = 'in' + propertyType;
      existing[propertyName] = !existing[propertyName];
      var url = 'v1/locations/' + this.locationId + '/products/' + existing.id;
      var payload = {
        inSpotlight: existing.inSpotlight,
        inGallery: existing.inGallery
      };
      utils.api.update(url, payload, function(err, res) {
        if(err) {
          return alert('unable to update product ' + propertyType + ' visibility');
        }
        this.publish('toggleProduct' + propertyType + 'End', { product: existing });
      }.bind(this));
    },
    saveProductOrderChanges: function(product, cb) {
      var url = 'v1/locations/' + this.locationId + '/products/' + product.id;
      var payload = {
        spotlightOrder: product.spotlightOrder,
        galleryOrder: product.galleryOrder
      };
      utils.api.update(url, payload, cb);
    },
    subscribe: {
      //expects {businessId, locationId}
      loadMenuBegin: function(msg) {
        troller.spinner.spin();
        this.businessId = msg.businessId;
        this.locationId = msg.locationId;
        var self = this;
        self.result = {
          products: [],
          sections: [],
          tags: []
        };
        //load all products for this business
        this.loadProducts(msg.locationId, function(err, result) {
          console.log('loaded products');
          self.result.products = result;
          self.loadMenuSections(msg.businessId, function(err, result) {
            console.log('loaded menu sections');
            self.result.sections = result;
            self.loadTags(msg.businessId, function(err, result) {
              console.log('loaded tags');
              self.result.tags = result;
              console.log('menu loaded', self.result);
              self.publish('loadMenuEnd', self.result);
              troller.spinner.stop();
            });
          });
        });
      },
      //resolves differences between sections
      //and does CRUD on each one that changed
      saveSectionChangesBegin: function(msg) {
        var diffs = this.getSectionDiffs(msg.oldSections, msg.newSections);
        troller.spinner.spin();
        this.processMenuSectionUpdates(diffs, function(err, res) {
          this.publish('loadMenuBegin', {
            businessId: this.businessId,
            locationId: this.locationId
          })
        }.bind(this));
      },
      saveProductBegin: function(product) {
        troller.spinner.spin();
        this.saveProduct(product, function(err, cb) {
          troller.spinner.stop();
          this.publish('saveProductEnd');
          //be lazy and reload the entire menu here
          this.publish('loadMenuBegin', {businessId: this.businessId, locationId: this.locationId});
        }.bind(this));
      },
      toggleProductSpotlightBegin: function(msg) {
        return this.updateProductVisibility(msg.id, 'Spotlight');
      },
      toggleProductGalleryBegin: function(msg) {
        return this.updateProductVisibility(msg.id, 'Gallery');
      },
      beginSaveProductsGalleryOrder: function(msg) {
        troller.spinner.spin();
        async.each(msg.products, this.saveProductOrderChanges.bind(this), function(err, res) {
          if(err) alert('problem saving tablet gallery ordering');
          this.publish('loadMenuBegin', {businessId: this.businessId, locationId: this.locationId});
        }.bind(this));
      }
    }
  });
});
