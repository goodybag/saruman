define(function(require) {
  var assert = function(truthy, msg) {
    if(!truthy) {
      var output = console.error.apply(console, [].slice.call(arguments, 1))
      throw [].slice.call(arguments, 1).join(' ');
    }
  };
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

        it('has 11 items in products collection', function() {
          assert(this.menu.products.length == 11)
        });

        it('has 6 sections', function() {
          assert(this.menu.sections.length == 6, 'should have 6 sections but had', this.menu.sections.length);
          console.log(this.menu.sections);
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
