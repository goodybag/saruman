define(function(require){
  var
    utils       = require('../../lib/utils')
  , config      = require('../../config')
  , api         = require('../../lib/api')
  , troller     = require('../../lib/troller')
  , TableItem   = require('../table/component').Item
  , PhotoEditor = require('../photo-editor/component').Main

  , template    = require('hbt!./list-item-tmpl')
  ;

  return TableItem.extend({
    initialize: function(options){
      options = options || {};

      options.template = options.template || template;

      this.categories = options.categories;
      this.allTags = options.allTags;

      return TableItem.prototype.initialize.call(this, options);
    }

  , render: function(){
      TableItem.prototype.render.call(this);

      // Add in photo editors
      this.$el.find('.photo-editor').replaceWith(
        new PhotoEditor({
          model:  this.model
        }).render().$el
      );

      // Categories select
      this.$el.find('.categories-select').select2({
        allowClear:   true
      , disabled:     true
      }).select2('disable');

      // Tags select
      this.$el.find('.tags-select').select2({
        allowClear:   true
      , disabled:     true
      , tags:         this.allTags._tags
      }).select2('disable');

      return this;
    }

  , enterEditMode: function(){
      if (this.mode === "edit") return this;

      TableItem.prototype.enterEditMode.call(this);

      this.$el.find('.tags-select, select').select2('enable');
    }

  , enterReadMode: function(){
      if (this.mode === "read") return this;

      TableItem.prototype.enterReadMode.call(this);

      this.$el.find('.tags-select, select').select2('disable');
    }

  , getAdditionalRenderProperties: function(){
      return {
        categories: this.categories
      , _tags: this.model.get('tags').map(
          function(tag){ return tag.tag }
        ).join(',')
      };
    }

  , updateBehaviors: {
      tags: function($el){
        console.log("updating model with", $el.val().split(','));
        return $el.val().split(',');
      }
    }
  });
});