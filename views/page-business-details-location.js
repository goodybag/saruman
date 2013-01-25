define(function(require){
  var
    utils    = require('../lib/utils')

  , api      = require('../lib/api')
  , pubsub   = require('../lib/pubsub')
  , channels = require('../lib/channels')

  , template = require('hbt!../templates/page-business-details-location')
  ;

  return utils.View.extend({
    className:  'location'
  , tagName:    'section'

  , events: {
      'click .edit':    'onClickEdit'
    , 'click .delete':  'onClickDelete'
    }

  , initialize: function(options){
      this.location = options.location;
      this.parent = options.parent;
      return this;
    }

  , render: function(){
      this.$el.html(template(this.location));
      return this;
    }

  , onClickEdit: function(e){
      utils.history.navigate('businesses/' + this.location.businessId + '/locations/' + this.location.id);
      pubsub.publish(channels.business.changePage.location, {
        location: this.location
      , parent: this
      });
    }

  , onClickDelete: function(e){
      var this_ = this;
      api.locations.del(this.location.id, function(error){
        if (error) return console.error(error);
      });
      this.undelegateEvents();
      this.$el.animate({ opacity: 0, height: '1px' }, function(){
        this_.parent.paginator.setTotal(this_.parent.paginator.total - 1);
        this_.remove();
      });
    }
  });
});