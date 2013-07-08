define(function(require) {
  var assert = function(truthy, msg) {
    if(!truthy) {
      var output = console.error.apply(console, [].slice.call(arguments, 1))
      throw [].slice.call(arguments, 1).concat(' ').join(' ');
    }
  };
  assert.equal = function(actual, expected) {
    assert(actual == expected, 'expected ' + expected + ' but found ' + actual);
  }
  var loader = require('../lib/bizpanel/menu-loader');
  var bus = require('../lib/pubsub');
  var api = require('../lib/api');

  var once = function(action, cb) {
    console.log('subscribing to', action);
    var token = bus.subscribe(action, function(name, val) {
      bus.unsubscribe(token);
      cb(val);
    });
  }

  describe('menu loader', function() {
    describe('#getLocationDiffs', function() {
      before(function() {
        this.locations = [{
          id: 1
        }, {
          id: 2
        }, {
          id: 3
        }];
        this.existingProducts = [{
          id: 1,
          locations: [{
            id: 1,
            isAvailable: true
          }, {
            id: 2,
            isAvailable: true
          }, {
            id: 3,
            isAvailable: true
          }]
        }, {
          id: 2,
          locations: [{
            id: 1,
            isAvailable: false
          }, {
            id: 2,
            isAvailable: false
          }, {
            id: 3,
            isAvailable: false
          }]
        }, {
          id: 3,
          locations: [{
            id: 1,
            isAvailable: true
          }, {
            id: 2,
            isAvailable: false
          }, {
            id: 3,
            isAvailable: true
          }]
        }]
        this.diff = function(product) {
          return loader.getLocationDiffs(this.locations, this.existingProducts, product);
        }
      });


      describe('with new product', function() {
        it('returns no changes if product is added to all locations', function() {
          var product = {
            id: 5000,
            locationIds: [1, 2, 3]
          };
          var changes = this.diff(product);
          assert.equal(changes.length, 0);
        });

        it('returns deletions if product is not in one of the locations', function() {
          var product = {
            id: 100,
            locationIds: [1, 3]
          };
          var changes = this.diff(product);
          assert.equal(changes.length, 1);
          var change = changes.pop();
          assert.equal(change.action, 'delete');
          assert.equal(change.locationId, 2);
          assert.equal(change.productId, 100);
        });
      });

      describe('with an existing product', function() {
        it('returns no changes if the product is the same', function() {
          var product = {
            id: 1,
            locationIds: [1, 2, 3]
          };
          var changes = this.diff(product);
          assert.equal(changes.length, 0);
        });

        it('returns additions and subtractions for total change', function() {
          var product = {
            id: 3,
            locationIds: [2]
          };
          var changes = this.diff(product);
          assert.equal(changes.length, 3);
          assert.equal(_.findWhere(changes, {locationId: 3}).action, 'delete');
          assert.equal(_.findWhere(changes, {locationId: 1}).action, 'delete');
          assert.equal(_.findWhere(changes, {locationId: 2}).action, 'add');
        });

        it('returns correct add-only changes', function() {
          var product = {
            id: 2,
            locationIds: [2]
          };
          var changes = this.diff(product);
          assert.equal(changes.length, 1);
          var change = changes[0];
          assert.equal(change.action, 'add');
          assert.equal(change.locationId, 2);
          assert.equal(change.productId, 2);
        });
      });
    });

    describe('#getSectionDiffs', function() {
      describe('all new creations', function() {
        before(function() {
          var oldSections = [];
          var newSections = [{
            //id doesn't matter since this id doesn't exist in old sections
            //it will be considered a new menu section
            id: '<UNSAVED>1',
            name: 'Section 1',
            description: 'Section 1 description',
            order: 1
          }, {
            id: '<UNSAVED>2',
            name: 'Section 2',
            description: 'Section 2 description',
            order: 2
          }];

          this.diffs = loader.getSectionDiffs(oldSections, newSections);
        });

        it('works', function() {
          assert(this.diffs, 'should have returned diffs');
          assert(this.diffs.length == 2, 'diffs should be an array of 2 but was ', this.diffs.length);
        });

        it('creates correct diff actions', function() {
          this.diffs.forEach(function(diff) {
            assert(diff.action == 'create', 'action should be create but was ', diff.action);
            assert(!diff.record.id, 'create record should not have an id');
          })
          var firstDiff = this.diffs[0].record;
          assert(firstDiff.name == 'Section 1', 'name should equal section 1 but equals', firstDiff);
          assert(firstDiff.description == 'Section 1 description', 'should have description');
          assert(firstDiff.order == 1, 'should have ordrer');
        });
      });

      describe('create & update & ignore', function() {
        before(function() {

          var oldSections = [{
            id: 1,
            name: 'Section 1!',
            description: 'Section 1 description',
            order: 1
          }, {
            id: 2,
            name: 'test',
            order: 5
          }];

          var newSections = [{
            id: 1,
            name: 'Section 1',
            description: 'I am section 1',
            order: 2
          }, {
            id: '<UNSAVED>2',
            name: 'Section 2',
            description: 'Section 2 description',
            order: 1
          }, {
            id: 2,
            name: 'test',
            order: 5
          }];

          this.diffs = loader.getSectionDiffs(oldSections, newSections);
          console.log(this.diffs);
        });

        it('creates two diffs', function() {
          assert(this.diffs.length === 2, 'should have 2 diffs but has', this.diffs.length);
        });

        it('has correct records in diff', function() {
          var first = this.diffs[0];
          assert.equal(first.action, 'update');
          assert.equal(first.record.name, 'Section 1');
          assert.equal(first.record.description, 'I am section 1');
          assert.equal(first.record.order, '2');

          var second = this.diffs[1];
          assert.equal(second.action, 'create');
          assert.equal(second.record.name, 'Section 2');
        });
      });

      describe('deleting', function() {
        before(function() {
          var oldSections = [{
            id: 1,
            name: 'blah'
          }, {
            id: 2,
            name: 'zug'
          }];
          var newSections = [{
            id: 1,
            name: 'blah'
          }];
          this.diffs = loader.getSectionDiffs(oldSections, newSections);
        });

        it('creates delete actions', function() {
          assert.equal(this.diffs.length, 1);
          assert.equal(this.diffs[0].action, 'delete')
          assert.equal(this.diffs[0].record.id, 2);
        });
      });
    });
  });
});
