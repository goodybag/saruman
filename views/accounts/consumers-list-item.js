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
      'click .avatarUrl':         'onAvatarClick'
    }

  , initialize: function(options){
      this.keyupSaveTimeout = 3000;

      options = options || {};

      this.isNew        = !!options.isNew;
      this.businesses   = options.businesses;
      this.businessIds  = options.businessIds;

      this.mode = 'read';

      this.template = template;

      return this;
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
  });
});