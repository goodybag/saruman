define(function(require){
  var
    Page      = require('./page')
  , template  = require('hbt!./../templates/login-page')
  ;

  return Page.extend({
    className: 'page page-login'

  , initialize: function(){
      this.template = template;
      console.log("login page initialized");
    }
  });
});