define(function(require){
  var
    utils     = require('../lib/utils')
  , Page      = require('./page')
  , api       = require('../lib/api')
  , troller   = require('../lib/troller')

  , template  = require('hbt!../templates/page-business-details-location-edit')
  , alertTemplate = require('hbt!./../templates/page-alert')
  , days = [
      'Monday'
    , 'Tuesday'
    , 'Wednesday'
    , 'Thursday'
    , 'Friday'
    , 'Saturday'
    , 'Sunday'
    ]
  ;

  return Page.extend({
    className:  'location-edit'
  , tagName:    'section'

  , events: {
      'focus input[type="time"]':         'onTimeFocus'
    , 'change .hour-action > input':      'onRadioSelect'
    , 'submit #location-details-form':    'onFormSubmit'
    , 'click .form-actions > .cancel':    'onFormCancel'
    , 'keyup .field-phone':              'onPhoneChange'
    }

  , initialize: function(options){
      var this_ = this;

      this.business = options.business;
      this.location = options.location;
      this.parent   = options.parent;
      this.create   = options.create;
      this.isNew    = options.isNew;

      // if (options.locationId){
      //   if ((this.location && this.location.id !== options.locationId) || !this.location){
      //     this.location = { id: options.locationId };
      //     this.fetchLocation();
      //   }
      // }

      if (this.create || !this.location){
        this.create = true;
        this.location = {};
      }

      utils.bindAll(this, 'alert');

      return this;
    }

  , onShow: function(data){
      // Reset previous state
      this.create = null;
      this.isNew = null;

      if (data.business) this.business = data.business;
      if (data.location) this.location = data.location;
      if (data.create)   this.create   = data.create;
      if (data.isNew)    this.isNew    = data.isNew;

      if (data.locationId){
        this.location = { id: data.locationId };
        this.fetchLocation();
      }

      if (this.create || !this.location){
        this.create = true;
        this.location = {};
      }

      this.render();
      this.delegateEvents();
    }

  , fetchLocation: function(){
      var this_ = this;

      api.locations.get(this.location.id, function(error, location){
        if (error) return troller.app.error(error);

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

      // Set states for closed/24-hour/unknown
      var start, end, day;
      for (var i = days.length - 1; i >= 0; i--){
        day   = days[i][0].toLowerCase() + days[i].substring(1);
        start = this.location['start' + days[i]];
        end   = this.location['end' + days[i]];

        // Set closed
        if (typeof start === "string" && start === end){
          this.$el.find('#location-' + day + '-closed-input').attr('checked', true);
          this.$el.find('#location-start-' + day + '-input').val("");
          this.$el.find('#location-end-' + day + '-input').val("");
        } else if (typeof start === "string" && typeof end === "string"){
          // Set 24-hour
          if (parseInt(end.split(':')[0]) - parseInt(start.split(':')[0]) === 24){
            this.$el.find('#location-' + day + '-all-day-input').attr('checked', true);
            this.$el.find('#location-start-' + day + '-input').val("");
            this.$el.find('#location-end-' + day + '-input').val("");
          }
        }
      }

      this.$phone = this.$el.find('.field-phone');
      this.$phoneDisp = this.$el.find('.field-phone-display');

      this.onPhoneChange();

      return this;
    }

  , onFormCancel: function(e){
      e.preventDefault();

      var this_ = this;

      if (this.isNew){
        api.locations.delete(this.location.id, function(error){
          if (error) alert(error);

          utils.history.navigate('businesses/' + this_.business.id + '/locations/page/1');
          troller.business.changePage('locations', { pageNum: 1 });
        });
      } else {
        utils.history.navigate('businesses/' + this_.business.id + '/locations/page/1');
        troller.business.changePage('locations', { pageNum: 1 });
      }
    }

  , onFormSubmit: function(e){
      e.preventDefault();

      troller.spinner.spin();

      this.clearErrors();

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
      , state:            'TX'
      , city:             this.$el.find('#location-city-input').val()
      , zip:              this.$el.find('#location-zip-input').val()
      , lat:              this.$el.find('#location-lat-input').val()
      , lon:              this.$el.find('#location-lon-input').val()
      , phone:            this.$el.find('#location-phone-input').val()
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
          data['start' + Day] = "00:00";
          data['end' + Day] = "24:00";
        }

        if (action === "unknown"){
          data['start' + Day] = null;
          data['end' + Day] = null;
        }
      });

      for (var key in data){
        // hack to avoid deleting hours
        // if (key.indexOf('start') > -1 || key.indexOf('end') > -1) continue;
        if (data[key] === null) delete data[key];
      }

      if (this.create){
        return api.locations.create(data, function(error){
          troller.spinner.stop();

          if (error) {
            console.log("poop");
            return troller.app.error(error, this_.$el, this_.alert);
          }
          utils.history.navigate('businesses/' + this_.business.id + '/locations/page/1');
          troller.business.changePage('locations', { pageNum: 1 });
        });
      }

      api.locations.update(this.location.id, data, function(error){
        troller.spinner.stop();

        if (error) {
          console.log("poo poo");
          return troller.app.error(error, this_.$el.find('#location-details-form'), this_.alert);
        }
        this_.doSuccessThing(
          this_.$el.find('.btn-primary')
        );
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

  , onPhoneChange: function(e) {
      var number = this.$phone.val();
      if (number == null) return;
      var a = number.slice(0, 3), b = number.slice(3, 6), c = number.slice(6, 10);
      this.$phoneDisp.val('(' + a + ') ' + b + '-' + c);
    }

  , alert: function(msg, error) {
      // Show a bootstrap alert message
      console.log("alert");
      var $alertContainer = this.$el.find('.alert-container')
        , template        = alertTemplate({ msg: msg, error: error });

      $alertContainer.html(template);
    }
  });
});
