define(function(require){
  var
    utils     = require('../../lib/utils')
  , config    = require('../../config')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , BaseListItem = require('./base-list-item')

  , template  = require('hbt!./../../templates/accounts/user-list-item')
  ;

  return BaseListItem.extend({
    type: 'users'

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      options = options || {};

      this.isNew      = !!options.isNew;
      this.allGroups  = options.allGroups;
      this.groupsById = options.groupsById;

      this.mode = 'read';

      this.template = template;

      return this;
    }

  , updateModelWithFormData: function(){
      var $el, this_ = this;
      for (var key in this.model.attributes){
        if (key === "groups"){
          $el = this.$el.find('#user-' + this.model.id + '-' + key);
          this.model.set(key, $el.val().map(function(v){
            return this_.groupsById[v];
          }));
        } else if (($el = this.$el.find('#user-' + this.model.id + '-' + key)).length > 0){
          this.model.set(key, $el.val());
        }
      }
      return this;
    }


  , getAdditionalRenderProperties: function(){
      return {
        groups:   this.allGroups
      , groupIds: (this.model.attributes.groups || []).map(function(g){ return g.id || g; })
      };
    }

  , getAdditionalSelect2Properties: function(){
      return {
        placeholder: "Select a Group"
      , allowClear: true
      , disabled: true
      };
    }
  });
});