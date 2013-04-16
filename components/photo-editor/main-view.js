define(function(require){
  var
    utils = require('../../../lib/utils')
  , template = require('hbt!./main-tmpl')
  ;

  return utils.View.extend({
    className: 'photo-editor'

  , events: {
      'click .photo-view':      'onPhotoViewClick'
    , 'click .photo-clear':     'onPhotoClearClick'
    , 'click .photo-edit':      'onPhotoEditClick'
    }

  , initialize: function(options){

    }

  , render: function(){
      this.$el.html(
        template({
          model: model.toJSON()
        })
      );
    }

  , onPhotoViewClick: function(e){
      e.preventDefault();
    }

  , onPhotoClearClick: function(e){
      e.preventDefault();
    }

  , onPhotoEditClick: function(e){
      e.preventDefault();
    }
  });
});