define(function(require){
  var
    utils     = require('../../lib/utils')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')
  ;

  return utils.View.extend({
    tagName: 'tr'

  , events: {
      'keyup .live-bind':         'onKeyUpLiveBind'
    }

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      this.model = options.user;

      return this;
    }

  , render: function(){
      this.$el.html(template(this.model.toJSON()));
      return this;
    }

  , updateModelWithFormData: function(){
      var $el;
      for (var key in this.model){
        if (($el = this.$el.find('#users-' + this.model.id + '-' + key)).length > 0)
          this.model[key] = $el.val();
      }
      return this;
    }

  , saveModel: function(){
      api.users.update(this.model.id, this.model, function(error){
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

  , onKeyUpLiveBind: function(e){
      this.updateModelWithFormData();
      this.saveModelWithTimeout();
      return this;
    }
  });
});