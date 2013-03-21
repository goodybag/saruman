define(function(require){
  var
    utils     = require('../../lib/utils')
  , config    = require('../../config')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , BaseListItem = require('./base-list-item')
  ;

  return BaseListItem.extend({
    initialize: function(options){
      this.keyupSaveTimeout = 3000;

      options = options || {};

      this.isNew    = !!options.isNew;
      this.business = options.business;

      this.mode = 'read';

      this.template = template;

      this.on('render', this.onRender, this);

      for (var key in BaseListItem.prototype.events){
        if (!(key in this.events)) this.events[key] = BaseListItem.prototype.events[key];
      }

      this.delegateEvents();

      return this;
    }

  , render: function(){
      this.$el.html(
        this.template(
          utils.extend({
            model: this.model.toJSON()
          , business: this.business
          }, this.getAdditionalRenderProperties())
        )
      );

      var $selects = this.$el.find('select').select2(
        utils.extend({
          allowClear:   true
        , disabled:     true
        }, this.getAdditionalSelect2Properties())
      );

      $selects.select2('disable');

      this.delegateEvents();

      this.mode = "read";

      return this;
    }
  });
});