define(function(require){
  var
    utils         = require('../../lib/utils')
  , config        = require('../../config')
  , api           = require('../../lib/api')
  , troller       = require('../../lib/troller')
  , TableItem     = require('../table/component').Item
  , PhotoEditor   = require('../photo-editor/component').Main

  , template      = require('hbt!./list-item-tmpl')
  , alertTemplate = require('hbt!./alert')
  ;

  return TableItem.extend({
    initialize: function(options){
      options = options || {};

      options.template = options.template || template;

      this.categories = options.categories;
      this.allTags    = options.allTags;
      utils.bindAll(this, 'alert');

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

      this.$el.find('.tags-select, .categories-select').select2('enable');

      return this;
    }

  , enterReadMode: function(){
      if (this.mode === "read") return this;

      TableItem.prototype.enterReadMode.call(this);

      this.$el.find('.tags-select, .categories-select').select2('disable');

      return this;
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
        var vals = $el.val().split(',');
        if (vals[0] == "" || vals[0] == null) vals = [];
        console.log("updating model.tags with", vals);
        return vals;
      }

    , categories: function($el){
        var vals = $el.val();

        if (!vals) return [];

        vals = vals.map(function(cat){
          if (typeof cat == 'object') return cat.id;
          if (typeof cat == 'string') return parseInt(cat);
          return cat;
        });
        return vals;
      }
    }

  , onEditSaveClick: function(e){
      e.preventDefault();

      if (this.mode === 'read') this.enterEditMode();
      else {
        var this_ = this;
        this.enterReadMode();
        this.updateModelWithFormData();
        this.saveModel(function(error){
          if (error) {
            return troller.app.error(error, this_.$el, this_.alert);
          }
          this_.render();
        });
      }
    }


  , alert: function(msg, error) {
      // Show a bootstrap alert message
      var $alertContainer = this.$el.closest('.page').find('.alert-container')
        , template        = alertTemplate({ msg: msg, error: error });

      $alertContainer.html(template);
    }
  });
});