define(function(require){
  var
    utils     = require('../../lib/utils')
  , troller   = require('../../lib/troller')
  , template  = require('hbt!./overlay-tmpl')
  , viewTmpl  = require('hbt!./view-photo-tmpl')
  ;

  return utils.View.extend({
    className: 'photo-editor'

  , events: {
      'click .view':        'onPhotoViewClick'
    , 'click .clear':       'onPhotoClearClick'
    , 'click .edit':        'onPhotoEditClick'
    }

  , initialize: function(options){
      return this;
    }

  , render: function(){
      this.$el.html(
        template({
          model: this.model.toJSON()
        })
      );

      return this;
    }

  , onPhotoViewClick: function(e){
      e.preventDefault();
      troller.spinner.spin();

      var $el = utils.dom( viewTmpl({ model: this.model.toJSON() }) );

      $el.find('img').on('load', function(e){
        troller.spinner.stop();
      });

      troller.modal.open($el);
    }

  , onPhotoClearClick: function(e){
      e.preventDefault();

      if (!troller.confirm('Are you sure you want to clear this photo?')) return;

      this.model.set('photoUrl', null);
      this.model.save();
      this.render();
    }

  , onPhotoEditClick: function(e){
      e.preventDefault();

      var this_ = this;
      filepicker.pick(
        { mimetypes:['image/*'] }
      , function(file){
          this_.model.set('photoUrl', file.url);
          if (this_.model.get('id') != 'New') this_.model.save();
          this_.render();
        }
      , function(error){ if (error.code != 101) troller.app.error(error); }
      );
    }
  });
});