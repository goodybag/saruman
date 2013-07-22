/**
 * Search View Component
 */

define(function(require){
  var
    utils     = require('../../lib/utils')
  , troller   = require('../../lib/troller')
  , api       = require('../../lib/api')

  , template  = require('hbt!./form-tmpl')
  ;

  return utils.View.extend({
    tagName:    'div'
  , className:  'row page-actions'

  , events: {
      'submit .search-wrapper': 'triggerSubmit'
    , 'change .search-select' : 'triggerSubmit'
    , 'keyup .search-query'  : 'triggerSubmit'
    }

  , initialize: function(options){
      options = options || {};

      this.render();
      this.$query = this.$el.find('.search-query');
      this.$type  = this.$el.find('.search-select');
      this.resetPage = true;
      return this;
    }

  , render: function() {
      this.$el.html(template());
      return this;
    }

  , triggerSubmit: function(e) {
      // 
      e.preventDefault();
      this.trigger('submit', this.resetPage);
    }
  });
});