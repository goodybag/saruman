define(function(require){
  var
    utils     = require('../../lib/utils')
  , config    = require('../../config')
  , api       = require('../../lib/api')
  , troller   = require('../../lib/troller')

  , BaseListItem = require('./base-list-item')

  , template  = require('hbt!./../../templates/accounts/consumer-list-item')
  ;

  return BaseListItem.extend({
    type: 'consumers'

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

      this.isNew  = !!options.isNew;

      this.mode = 'read';

      this.template = template;

      return this;
    }

  , onAvatarClick: function(e){
      var this_ = this;
      filepicker.pick(
        { mimetypes:['image/*'] },
        function(file) { this_.model.avatarUrl = file.url; },
        function(error) { alert(error); }
      );
    }
  });
});