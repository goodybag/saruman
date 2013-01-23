define(function(require){
  var
    Page      = require('./page')
  , template  = require('hbt!./../templates/page-dashboard')
  ;

  return Page.extend({
    className: 'page page-dashboard'

  , events: { 'click h1': 'test'}

  , test: function(){ alert('aldksfj')}

  , initialize: function(){
      this.template = template;
    }
  });
});