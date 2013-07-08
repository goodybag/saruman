define(function(require) {
  var api = require('../api');
  var troller = require('../troller');
  var async = require('async');
  var utils = require('../utils');
  var subscribe = require('./subscribe');
  return subscribe({
    loadProducts: function(businessId, locationId, cb) {
      var self = this;
      var url = 'v1/businesses/' + businessId + '/products';
      var params = {
        spotlight: true,
        all: true,
        include: ['tags', 'categories', 'locations'],
        limit: 1000
      };
      var self = this;
      //normalize gallery & spotlight sort order
      return utils.api.get(url, params, function(err, products) {
        //figure out which locations this product belongs to
        //and give it a collection of all locations, each indicating
        //whether or not the product belongs to it
        _.each(products, function(product) {
          product.isAvailable = false;
          var productLocations = product.locations || [];
          var allLocations = self.allLocations;
          var locs = _.map(allLocations, function(location) {
            var productLocation = _.findWhere(productLocations, { locationId: location.id });
            //if the product belongs to the currently selected location in the UI
            //then set product properties based on the location information
            if(productLocation && productLocation.locationId == locationId) {
              product.isAvailable = true;
              product.spotlightOrder = productLocation.spotlightOrder;
              product.inSpotlight = productLocation.inSpotlight;
              product.galleryOrder = productLocation.galleryOrder;
              product.inGallery = productLocation.inGallery;
            }
            var result = {
              id: location.id,
              street1: location.street1,
              isAvailable: !!productLocation
            };
            return result;
          });
          product.locations = locs;
        });
        return cb(err, products);
      });
    },
    loadMenuSections: function(businessId, cb) {
      console.log('loading product categories');
      api.businesses.productCategories.list(businessId, function(err, res) {
        //only callback with 2 parameters because the async library gets
        //weird when you return more than err, arg1 to the callback
        return cb(err, res);
      });
    },
    //load all tags for business
    loadTags: function(businessId, cb) {
      console.log('loading business tags');
      //only callback with 2 parameters because the async library gets
      //weird when you return more than err, arg1 to the callback
      api.productTags.list({businessId: businessId}, function(err, tags) {
        return cb(err, tags);
      });
    },
    changed: function(old, current, properties) {
      for(var i = 0; i < properties.length; i++) {
        var property = properties[i];
        if(old[property] != current[property]) {
          //null does not equal empty string, but it didn't actually change
          if(!(old[property] == null && current[property] == '')) {
            return true;
          }
        }
      }
      return false;
    },
    //calculate diffs between old and new sections
    //and return diff objects used to fire off
    //CRUD requests.  This is broken out into its own
    //function so that it's testable
    //this is tested in test/menu-loader.js
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
          if(this.changed(old, record, ['name', 'description', 'order'])) {
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
    //calculates a diff of which location mappings need to be modified
    //for the product data being updated
    //productData is the form data coming from the add/edit
    //product form
    //this is tested in test/menu-loader.js
    getLocationDiffs: function(existingLocations, existingProducts, productData) {
      var existingIds = _.pluck(existingLocations, 'id');
      var newIds = productData.locationIds;
      var existingProduct = _.findWhere(existingProducts, {id: productData.id})
      if(existingProduct) {
        var existingIds = [];
        for(var i = 0; i < existingProduct.locations.length; i++) {
          var loc = existingProduct.locations[i];
          if(loc.isAvailable) {
            existingIds.push(loc.id);
          }
        }
      }

      var toRemove = _.difference(existingIds, newIds);
      var actions = [];
      actions = actions.concat(_.map(toRemove, function(id) {
        return {
          action: 'delete',
          locationId: id,
          productId: productData.id
        }
      }));

      if(!existingProduct) {
        console.log('NEW PRODUCT')
        //a new product is automatically added to all locations
        //so we only need the delete actions
        return actions;
      } else {
        var toAdd = _.difference(newIds, existingIds);
        return actions.concat(_.map(toAdd, function(id) {
          return {
            action: 'add',
            locationId: id,
            productId: productData.id
          }
        }));
      }
    },
    createCategory: function(category, cb) {
      var data = {
        name: category.name,
        description: category.description,
        order: category.order
      };
      api.businesses.productCategories.create(this.businessId, data, cb);
    },
    updateCategory: function(category, cb) {
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

        if(product.id) {
          return api.products.update(product.id, payload, function(err) {
            if(err) return cb(err);
            return this.updateProductLocationAvailability(this.allLocations, this.result.products, product, cb);
          }.bind(this));
        }

        return api.products.create(payload, function(err, res) {
          if(err) return cb(err);
          var toUpdate = {
            id: res.id,
            locationIds: product.locationIds
          }
          return this.updateProductLocationAvailability(this.allLocations, this.result.products, toUpdate, cb);
        }.bind(this));
      }.bind(this));
    },
    processProductLocationDiff: function(diff, cb) {
      console.log('WOULD UPDATE DIFF', diff)
      if(diff.action == 'delete') {
        var url = 'v1/locations/' + diff.locationId + '/products/' + diff.productId;
        return utils.api.del(url, cb);
      }
      var url = 'v1/locations/' + diff.locationId + '/products';
      var payload = {
        productId: diff.productId
      };
      utils.api.post(url, payload, cb);
    },
    updateProductLocationAvailability: function(existingLocations, existingProducts, productData, cb) {
      var diffs = this.getLocationDiffs(existingLocations, existingProducts, productData);
      if(!diffs.length) {
        return cb(null);
      }
      async.each(diffs, this.processProductLocationDiff.bind(this), cb);
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
          this.publish('showError', { message: 'There was an error when trying to update product visibility.' });
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
      loadManagerEnd: function(msg) {
        this.allLocations = msg.business.locations;
      },
      //expects {businessId, locationId}
      loadMenuBegin: function(msg) {
        troller.spinner.spin();
        this.businessId = msg.businessId;
        this.locationId = msg.locationId;
        var self = this;
        var result = self.result = {
          products: [],
          sections: [],
          tags: []
        };
        //loading the menu requires 3 ajax requests
        var actions = {
          products: this.loadProducts.bind(this, msg.businessId, msg.locationId),
          sections: this.loadMenuSections.bind(this, msg.businessId),
          tags: this.loadTags.bind(this, msg.businessId)
        };
        //run them all at the same time
        return async.parallel(actions, function(err, data) {
          if(err) return self.publish('showError', {message: "There was a problem loading the menu."})
          _.extend(result, data);
          self.publish('loadMenuEnd', result);
          troller.spinner.stop();
        });
      },
      //resolves differences between sections
      //and does CRUD on each one that changed
      saveSectionChangesBegin: function(msg) {
        var diffs = this.getSectionDiffs(msg.oldSections, msg.newSections);
        //no changes to save, just refresh menu immediately
        if(0 === diffs.length) {
          return this.publish('loadMenuEnd', this.result);
        };
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
          if(err) {
            this.publish('showError', {message: 'There was a problem saving the product'});
          }
          troller.spinner.stop();
          this.publish('saveProductEnd');
          //be lazy and reload the entire menu here
          return this.publish('loadMenuBegin', {businessId: this.businessId, locationId: this.locationId});
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
          if(err) return this.publish('showError', {message: 'There was an error when trying to save the new product order.'})
          this.publish('loadMenuBegin', {businessId: this.businessId, locationId: this.locationId});
        }.bind(this));
      }
    }
  });
});
