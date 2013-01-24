define(function(require){
  var
    Backbone = require('backbone')

  , template = require('hbt!../templates/nav')
  , user     = require('../models/user')
  ;

  return Backbone.View.extend({
    className: 'navbar navbar-inverse navbar-fixed-top'

  , initialize: function(){
      user.on('auth', this.render, this);
      user.on('deauth', this.render, this);
    }

  , render: function(){
      this.$el.html(template({
        loggedIn: user.get('loggedIn')
      }));
    }
  });
});