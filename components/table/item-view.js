define(function(require){
  var
    utils     = require('../../lib/utils')
  , troller   = require('../../lib/troller')
  , template  = require('hbt!./list-item-tmpl')
  ;

  return utils.View.extend({
    tagName: 'tr'

  , events: {
      'keyup .live-bind':         'onKeyUpLiveBind'
    , 'click .btn-edit-save':     'onEditSaveClick'
    , 'click .btn-cancel':        'onCancelClick'
    , 'click .btn-delete':        'onDeleteClick'
    , 'click .btn-copy':          'onCopyClick'
    }

  , updateBehaviors: {}

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      options = options || {};

      this.template = options.template || template;

      this.isNew = !!options.isNew;

      this.mode = 'read';


      // Bind update behaviors
      for (var key in this.updateBehaviors){
        this.updateBehaviors[key] = utils.bind(this.updateBehaviors[key], this);
      }

      return this;
    }

  , render: function(){
      this.$el.html(
        this.template(
          utils.extend({
            model: this.model.toJSON()
          }, this.getAdditionalRenderProperties())
        )
      );

      this.delegateEvents();

      this.mode = "read";

      return this;
    }

  , getAdditionalSelect2Properties: function(){ return {}; }

  , getAdditionalRenderProperties: function(){ return {}; }

  , enterEditMode: function(){
      if (this.mode === "edit") return this;

      this.$el.find('.btn-edit').removeClass('btn-edit').addClass('btn-save btn-success');
      this.$el.find('.icon-edit').removeClass('icon-edit').addClass('icon-save');
      this.$el.find('.btn-cancel').removeClass('hide');

      this.$el.find('.btn-copy').addClass('hide');

      this.$el.find('.read-mode-value').css({ display: 'none', opacity: 0 });
      this.$el.find('.edit-mode-value').css({
        display: 'inline-block'
      , opacity: 1
      });

      this.$el.find('input[type="checkbox"]').removeAttr('disabled');

      this.mode = "edit";

      return this;
    }

  , enterReadMode: function(){
      if (this.mode === "read") return this;

      this.$el.find('.btn-save').removeClass('btn-save btn-success').addClass('btn-edit');
      this.$el.find('.icon-save').removeClass('icon-save').addClass('icon-edit');

      this.$el.find('.btn-cancel').addClass('hide');

      this.$el.find('.btn-copy').removeClass('hide');

      this.$el.find('.edit-mode-value').css({ display: 'none', opacity: 0 });
      this.$el.find('.read-mode-value').css({
        display: 'inline-block'
      , opacity: 1
      });

      this.$el.find('input[type="checkbox"]').attr('disabled', true);

      this.mode = "read";

      return this;
    }

  , updateModelWithFormData: function(){
      var $el;
      for (var key in this.model.attributes){
        if (($el = this.$el.find('#item-' + this.model.get('id') + '-' + key)).length > 0){

          // Extended behavior
          if (this.updateBehaviors[key])
            this.model.set(key, this.updateBehaviors[key]($el));

          // Checkbox or radio
          else if ($el[0].tagName === "INPUT" && ($el[0].type === "checkbox" || $el[0].type === "radio"))
            this.model.set(key, $el[0].checked == true);

          // Textarea
          else if ($el[0].tagName === "TEXTAREA")
            this.model.set(key, $el[0].value);

          // Price needs to be multiplied by 100
          else if ($el.hasClass('field-price'))
            this.model.set(key, Math.round($el.val() * 100))

          // Everything else
          else this.model.set(key, $el.val());
        }
      }

      return this;
    }

  , saveModel: function(callback){
      this.model.save(callback);

      return this;
    }

  , saveModelWithTimeout: function(){
      var this_ = this;
      clearTimeout(this.saveModelTimeout);
      this.saveModelTimeout = setTimeout(function(){
        this_.saveModel();
      }, this.keyupSaveTimeout);
      return this;
    }

  , destroy: function(){
      if (this.model.get('id') && this.model.get('id') !== 'New') this.model.delete();

      this.undelegateEvents();

      this.$el.removeData().unbind();

      //Remove view from DOM
      this.remove();

      this.trigger('destroy');
    }

  , onCopyClick: function(e){
      this.trigger('copy', this.model);
    }

  , onDeleteClick: function(e){
      if (!confirm("Are you sure you want to delete this record?"))
        return;

      this.destroy();
    }

  , onCancelClick: function(e){
      e.preventDefault()

      // We just want to delete the whole thing on cancel if it's a new item
      if (this.isNew) return this.destroy();

      this.render();
      this.enterReadMode();
    }

  , onEditSaveClick: function(e){
      e.preventDefault();

      if (this.mode === 'read') this.enterEditMode();
      else {
        var this_ = this;
        this.enterReadMode();
        this.updateModelWithFormData();
        this.saveModel(function(error){
          if (error) troller.error(error);
          this_.render();
        });
      }
    }

  , onKeyUpLiveBind: function(e){
      this.updateModelWithFormData();
      this.saveModelWithTimeout();
      return this;
    }
  });
});
