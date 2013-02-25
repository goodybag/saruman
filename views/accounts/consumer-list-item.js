define(function(require){
  var
    utils     = require('../../lib/utils')
  , config    = require('../../config')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , template  = require('hbt!./../../templates/accounts/consumer-list-item')
  ;

  return utils.View.extend({
    tagName: 'tr'

  , events: {
      'keyup .live-bind':         'onKeyUpLiveBind'
    , 'click .btn-edit-save':     'onEditSaveClick'
    , 'click .btn-cancel':        'onCancelClick'
    , 'click .btn-delete':        'onDeleteClick'
    , 'click .btn-copy':          'onCopyClick'
    , 'click .avatarUrl':         'onAvatarClick'
    }

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      options = options || {};

      this.isNew = !!options.isNew;

      this.mode = 'read';
      this.allGroups = options.allGroups;


      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          model: this.model
        })
      );

      var $selects = this.$el.find('select').select2({
        placeholder: "Select a Group"
      , allowClear: true
      , disabled: true
      });

      $selects.select2('disable');

      return this;
    }

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

      this.$el.find('select').select2('enable');

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

      this.$el.find('select').select2('disable');

      this.mode = "read";

      return this;
    }

  , updateModelWithFormData: function(){
      var $el;
      for (var key in this.model){
        if (($el = this.$el.find('#user-' + this.model.id + '-' + key)).length > 0)
          this.model[key] = $el.val();
      }
      return this;
    }

  , saveModel: function(callback){
      var model = utils.clone(this.model), this_ = this;
      delete model.id;

      if (this.isNew){
        api.users.consumers.create(model, function(error, result){
          if (error) alert(error.message);

          this_.model.id = result.id;
          if (callback) callback(null, result);
        });
        return this;
      }

      api.users.consumers.update(this.model.id, model, function(error){
        if (error) alert(error.message);
      });

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
      if (!this.isNew) api.users.consumers.delete(this.model.id);

      this.undelegateEvents();

      this.$el.removeData().unbind();

      //Remove view from DOM
      this.remove();

      Backbone.View.prototype.remove.call(this);

      this.trigger('destroy');
    }

  , onAvatarClick: function(e){
      var this_ = this;
      filepicker.pick(
        { mimetypes:['image/*'] },
        function(file) {
          this_.model.avatarUrl = file.url;
        },
        function(error) {
          console.log(error);
        }
      );
    }

  , onCopyClick: function(e){
      this.trigger('copy', this.model);
    }

  , onDeleteClick: function(e){
      if (!confirm("Are you sure you want to delete " + (this.model.email || "this record") + "?"))
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
        this.saveModel(function(){
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