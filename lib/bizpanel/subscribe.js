//mixin to allow objects to have message inboxes
//and an easy to access publish message
define(function(require) {
  var bus = require('../pubsub');
  return function(listener) {
    listener.publish = function(name, msg) {
      bus.publish(name, msg);
    };
    for(var key in listener.subscribe) {
      (function(k) {
        bus.subscribe(k, function(name, msg) {
          listener.subscribe[k].call(listener, msg);
        });
      })(key)
    }
    return listener;
  };
});
