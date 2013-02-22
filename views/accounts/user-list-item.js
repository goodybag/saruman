define(function(require){
  var
    utils     = require('../../lib/utils')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , template  = require('hbt!./../../templates/accounts/user-list-item')
  ;

  return utils.View.extend({
    tagName: 'tr'

  , events: {
      'keyup .live-bind':         'onKeyUpLiveBind'
    , 'click .btn-edit-save':     'onEditSaveClick'
    , 'click .btn-cancel':        'onCancelClick'
    }

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      this.model.groups = this.model.groups || [];
      this.groupIds = this.model.groups.map(function(g){ return g.id; });

      this.mode = 'read';
      this.allGroups = options.allGroups;


      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          model: this.model
        , groups: this.allGroups
        , groupIds: this.groupIds
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

  , saveModel: function(){
      var model = utils.clone(this.model);
      delete model.id;
      api.users.update(this.model.id, model, function(error){
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

  , onCancelClick: function(e){
      e.preventDefault();

      this.render();
      this.enterReadMode();
    }

  , onEditSaveClick: function(e){
      e.preventDefault();

      if (this.mode === 'read') this.enterEditMode();
      else {
        this.enterReadMode();
        this.updateModelWithFormData();
        this.saveModel();
        this.render();
      }
    }

  , onKeyUpLiveBind: function(e){
      this.updateModelWithFormData();
      this.saveModelWithTimeout();
      return this;
    }
  });
});