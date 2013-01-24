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

      var fixTime = function(val){
        if (val === "") return null;

        val = val.split(':');
        var ampm = "am";

        if (val[0] >= 12){
          val[0] -= 12;
          ampm = "pm";
        }

        return val[0] + ":" + val[1] + " " + ampm;
      }

      var data = {
        businessId:       this.business.id
      , name:             this.$el.find('#location-name-input').val()
      , street1:          this.$el.find('#location-street1-input').val()
      , street2:          this.$el.find('#location-street2-input').val()
      , state:            this.$el.find('#location-state-input').val()
      , city:             this.$el.find('#location-city-input').val()
      , zip:              this.$el.find('#location-zip-input').val()
      , lat:              this.$el.find('#location-lat-input').val()
      , lon:              this.$el.find('#location-lon-input').val()
      , startSunday:      fixTime(this.$el.find('#location-start-sunday-input').val())
      , endSunday:        fixTime(this.$el.find('#location-end-sunday-input').val())
      , startMonday:      fixTime(this.$el.find('#location-start-monday-input').val())
      , endMonday:        fixTime(this.$el.find('#location-end-monday-input').val())
      , startTuesday:     fixTime(this.$el.find('#location-start-tuesday-input').val())
      , endTuesday:       fixTime(this.$el.find('#location-end-tuesday-input').val())
      , startWednesday:   fixTime(this.$el.find('#location-start-wednesday-input').val())
      , endWednesday:     fixTime(this.$el.find('#location-end-wednesday-input').val())
      , startThursday:    fixTime(this.$el.find('#location-start-thursday-input').val())
      , endThursday:      fixTime(this.$el.find('#location-end-thursday-input').val())
      , startFriday:      fixTime(this.$el.find('#location-start-friday-input').val())
      , endFriday:        fixTime(this.$el.find('#location-end-friday-input').val())
      , startSaturday:    fixTime(this.$el.find('#location-start-saturday-input').val())
      , endSaturday:      fixTime(this.$el.find('#location-end-saturday-input').val())
      };

      this.$el.find('input[type="radio"]').each(function(i, el){
        if (!el.checked) return;
        var
          action = el.className
        , day = el.name.split('-')[1]
        , Day = day[0].toUpperCase() + day.substring(1)
        ;

        if (action === "closed"){
          data['start' + Day] = "12:00 am";
          data['end' + Day] = "12:00 am";
        }

        // this is wrong, but it doesn't seem like we're supporting the dates we had discussed
        if (action === "all-day"){
          data['start' + Day] = "12:00 am";
          data['end' + Day] = "12:00 am";
        }

        if (action === "unknown"){
          data['start' + Day] = null;
          data['end' + Day] = null;
        }
      });

      if (this.create){
        return api.locations.create(data, function(error){
          if (error) return console.error(error);

          Backbone.history.navigate('businesses/' + this_.business.id + '/locations/page/1');
          pubsub.publish(channels.business.changePage.locations, {
            pageNum: 1
          });
        });
      }

      api.locations.update(this.location.id, data, function(error){
        if (error) return console.error(error);

        Backbone.history.navigate('businesses/' + this_.business.id + '/locations/page/1');
        pubsub.publish(channels.business.changePage.locations, {
          pageNum: 1
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