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

    describe('as admin', function() {
      before(function(done) {
        api.session.auth('admin@goodybag.com', 'password', function(err, user) {
          console.log((user||0).email, 'logged in')
          done(err);
        });
      });

      describe('loading Amys from test {bId: 39, locId: 51}', function() {
        before(function(done) {
          var self = this;
          bus.publish('loadMenuBegin', {
            //use amys
            businessId: 39,
            locationId: 51
          });
          once('loadMenuEnd', function(val) {
            self.menu = val;
            done();
          });
        });

        it('has 42 items in products collection', function() {
          assert.equal(this.menu.products.length, 42)
        });

        describe('menu sections', function() {
          it('has 6 sections', function() {
            assert(this.menu.sections.length == 6, 'should have 6 sections but had', this.menu.sections.length);
            console.log(this.menu.sections);
          });

          it('is a sorted collection', function() {
            var max = 0;
            for(var i = 0; i < this.menu.sections.length; i++) {
              var section = this.menu.sections[i];
              assert(section.order >= max, 'expected sections to be sorted');
              max = section.order;
            }
          });
        });

        describe('first item', function() {
          before(function() {
            this.item = this.menu.products[0];
          });

          it('has categories', function() {
            assert(this.item.categories.length == 0, 'should have 0 categories but has', this.item.categories.length);
          });

          it('has tags', function() {
            assert(this.item.tags.length == 6, 'should have 6 tags but has', this.item.tags.length)
          });
        });
      });
    });
  });
});
