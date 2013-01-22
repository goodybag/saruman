define(function(require){
  var
    Page      = require('./page')
  , template  = require('hbt!./../templates/page-dashboard')
  ;

  return Page.extend({
    className: 'page page-login'

  , initialize: function(){
      this.template = template;
    }
  });
});