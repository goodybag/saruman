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
      troller.modal.open( viewTmpl({ model: this.model.toJSON() }) );
    }

  , onPhotoClearClick: function(e){
      e.preventDefault();

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
          this_.model.save();
          this_.render();
        }
      , function(error){ if (error.code != 101) troller.app.error(error); }
      );
    }
  });
});