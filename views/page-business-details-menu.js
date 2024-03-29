define(function(require){
  var
    utils     = require('../lib/utils')
  , Page      = require('./page')
  , config    = require('../config')
  , api       = require('../lib/api')
  , troller   = require('../lib/troller')

  , template  = require('hbt!../templates/page-business-details-menu')
  ;

  return Page.extend({
    className:  'menu-details'
  , tagName:    'section'

  , events: {
      'submit #menu-details-form': 'onFormSubmit'
    , 'keyup #menu-details-description': 'onDescriptionKeyup'
    , 'submit #add-new-tag': 'onNewTagSubmit'
    }

  , initialize: function(options){
      var this_ = this;

      this.business = options.business;

      return this;
    }

  , onShow: function(){
      this.tags = this.business.tags;
    }

  , render: function(){
      // Merge in new tags
      if (!this.tags || this.tags.length === 0 || this.tags[0] == null || !this.tags[0].name){
        this.tags = config.cuisineTypes.slice(0);
        if (this.business && this.business.tags){
          for (var i = this.business.tags.length - 1; i >= 0; i--){
            if (this.tags.indexOf(this.business.tags[i]) > -1) continue;
            this.tags.push(this.business.tags[i]);
          }

          for (var i = this.tags.length - 1; i >= 0; i--){
            this.tags[i] = {
              name: this.tags[i]
            , checked: this.business.tags.indexOf(this.tags[i]) > -1
            }
          }
        }
      }

      this.$el.html(template({
        tags: this.tags
      , menuDescription: this.business.menuDescription
      }));

      return this;
    }

  , onNewTagSubmit: function(e){
      e.preventDefault();

      var $tag = $('#new-tag-name'), tag = $tag.val();

      if (tag === "") return;

      if (this.tags.indexOf(tag) > -1) return $tag.val("");

      this.tags.push({ name: tag, checked: true });
      this.render();
    }

  , onDescriptionKeyup: function(e){
      this.business.menuDescription = e.target;
    }

  , onFormSubmit: function(e){
      e.preventDefault();

      var this_ = this;

      this.business.menuDescription = this.$el.find('#menu-details-description').val();
      this.business.tags = [];

      this.$el.find('input[type="checkbox"]').each(function(i, el){
        if (el.checked) this_.business.tags.push(el.value);
      });

      // Reset local tags collection to reflect changes
      console.log(this.tags)
      this.tags = this.tags.map(function(t){
        t.checked = this_.business.tags.indexOf(t.name) > -1;
        return t;
      });

      var data = {
        menuDescription: this.business.menuDescription
      , tags: this.business.tags
      };

      api.businesses.update(this.business.id, data, function(error){
        if (error) return troller.app.error(error);

        utils.history.navigate('businesses/' + this_.business.id + '/locations/page/1');
        troller.business.changePage('locations', { pageNum: 1 });
      });
    }
  });
});