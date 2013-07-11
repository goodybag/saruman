define(function(require) {
  var utils = require('../../lib/utils');
  var template = require('hbt!./template')
  var moment = require('moment');
  var EditHoursView =  utils.View.extend({
    backendDateFormat: 'HH:mm:ss',
    events: {
      'blur .hours input.time': 'updateDate',
      'click .hours .closed': 'closeClicked',
      'click .hours .all-day': 'allDayClicked'
    },
    closeClicked: function(e) {
      var el = $(e.target);
      var checked = el.is(':checked');
      var row = el.closest('.day');
      row.find('input.time').attr('disabled', checked);
      row.find('input.all-day').attr('checked', false);
    },
    allDayClicked: function(e) {
      var el = $(e.target);
      var checked = el.is(':checked');
      var row = el.closest('.day');
      row.find('input.time').attr('disabled', checked);
      row.find('input.closed').attr('checked', false);
    },
    parseDate: function(timeString) {
      var date = moment(timeString, ['hh:mm A', 'h:mm A', 'h:mmA','HH', 'hh', 'HH:mm', 'hh A', 'hhA', 'hha', 'hh a', 'HHa']);
      if(date && date.isValid()) {
        return date;
      }
      return moment('00:00:00', this.backendDateFormat);
    },
    updateDate: function(e) {
      var el = $(e.target);
      var timeString = el.val();
      var date = this.parseDate(timeString);
      el.val(this.formatDate(date));
    },
    formatDate: function(backendDate) {
      var date = moment(backendDate, this.backendDateFormat)
      return date ? date.format('hh:mm A') : '--:--';
    },
    getHoursForView: function(location) {
      var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      var result = [];
      for(var i = 0; i < days.length; i++) {
        var day = days[i];
        var item = {};
        item.name = day;
        var start = location['start' + day];
        var end = location['end' + day];
        item.start = this.formatDate(start);
        item.end = this.formatDate(end);
        if(start == end) {
          item.closed = true;
        } else if(start == '00:00:00' && end == '24:00:00') {
          item.allDay = true;
        }
        item.disabled = item.allDay || item.closed;
        result.push(item);
      }
      return {days: result};
    },
    //get values from control
    //in the same format used as the data-model
    //on the location object
    getValues: function() {
      var rows = this.$el.find('.day');
      var results = {};
      rows.each(function(i, el) {
        el = $(el);
        var startTime = '00:00';
        var endTime = '00:00';
        if(el.find('.closed').is(':checked')) {
          //do nothing, already using those values
        } else if(el.find('.all-day').is(':checked')) {
          startTime = '00:00';
          endTime = '24:00';
        } else {
          //actually parse the dates
          startTime = this.parseDate(el.find('.start').val()).format('HH:mm');
          endTime = this.parseDate(el.find('.end').val()).format('HH:mm');
        }
        var dayName = el.data('dayName');
        results['start' + dayName] = startTime;
        results['end' + dayName] = endTime;
      }.bind(this));
      return results;
    },
    render: function(location) {
      var viewData = this.getHoursForView(location);
      this.$el.html(template(viewData));
    }
  });
  return EditHoursView;
})
