define(function(require){
  var
    Backbone  = require('backbone')
  , Page      = require('./page')
  , api       = require('../lib/api')
  , pubsub    = require('../lib/pubsub')
  , channels  = require('../lib/channels')

  , template  = require('hbt!../templates/page-business-details-location-edit')
  ;

  return Page.extend({
    className:  'location-edit'
  , tagName:    'section'

  , events: {
      'focus input[type="time"]':         'onTimeFocus'
    , 'change .hour-action > input':      'onRadioSelect'
    , 'submit #location-details-form':    'onFormSubmit'
    }

  , initialize: function(options){
      var this_ = this;

      this.business = options.business;
      this.location = options.location;
      this.parent   = options.parent;
      this.create   = options.create;

      if (options.locationId){
        this.location = { id: options.locationId }
        this.fetchLocation();
      }

      if (this.create || !this.location){
        this.create = true;
        this.location = {};
      }

      pubsub.subscribe(channels.business.changePage.location, function(channel, data){
        if (data.business) this_.business = data.business;
        if (data.location) this_.location = data.location;
        if (data.create)   this_.create   = data.create;

        if (data.locationId){
          this_.location = { id: data.locationId };
          this_.fetchLocation();
        }

        if (this_.create || !this_.location){
          this_.create = true;
          this_.location = {};
        }

        this_.render();
      });

      return this;
    }

  , fetchLocation: function(){
      var this_ = this;

      api.locations.get(this.location.id, function(error, location){
        if (error) return console.error(error);

        this_.location = location;
        this_.render();
      });
    }

  , render: function(){
      this.$el.html(template(this.location));

      // Set state
      this.$el.find(
        '#location-state-input > option[value="' + this.location.state + '"]'
      ).attr('selected', 'selected');

      return this;
    }

  , onFormSubmit: function(e){
      e.preventDefault();

      var this_ = this;

      var data = {
        businessId:       this.business.id
      , name:             $('#location-name-input').val()
      , street1:          $('#location-street1-input').val()
      , street2:          $('#location-street2-input').val()
      , state:            $('#location-state-input').val()
      , city:             $('#location-city-input').val()
      , zip:              $('#location-zip-input').val()
      , lat:              $('#location-lat-input').val()
      , lon:              $('#location-lon-input').val()
      , startSunday:      $('#location-start-sunday-input').val() || null
      , endSunday:        $('#location-end-sunday-input').val() || null
      , startMonday:      $('#location-start-monday-input').val() || null
      , endMonday:        $('#location-end-monday-input').val() || null
      , startTuesday:     $('#location-start-tuesday-input').val() || null
      , endTuesday:       $('#location-end-tuesday-input').val() || null
      , startWednesday:   $('#location-start-wednesday-input').val() || null
      , endWednesday:     $('#location-end-wednesday-input').val() || null
      , startThursday:    $('#location-start-thursday-input').val() || null
      , endThursday:      $('#location-end-thursday-input').val() || null
      , startFriday:      $('#location-start-friday-input').val() || null
      , endFriday:        $('#location-end-friday-input').val() || null
      , startSaturday:    $('#location-start-saturday-input').val() || null
      , endSaturday:      $('#location-end-saturday-input').val() || null
      };

      for (var key in data){
        if (data[key] === null) delete data[key];
      }

      if (this.create){
        return api.locations.create(data, function(error){
          if (error) return console.error(error);

          Backbone.history.navigate('businesses/' + this_.business.id + '/locations/page/1');
          pubsub.publish(channels.business.changePage.locations, {
            page: 1
          });
        });
      }

      api.locations.update(this.location.id, data, function(error){
        if (error) return console.error(error);

        Backbone.history.navigate('businesses/' + this_.business.id + '/locations/page/1');
        pubsub.publish(channels.business.changePage.locations, {
          page: 1
        });
      });
    }

  , onTimeFocus: function(e){
      var
        $time = $(e.target)
      , $group = $time.parent()
      ;

      // Uncheck any checked radios
      $group.find('input[type="radio"]').each(function(i, radio){
        radio.checked = false;
      });
    }

  , onRadioSelect: function(e){
      // Clear days time
      $(e.target).parent().parent().find('input[type="time"]').val("");
    }
  });
});