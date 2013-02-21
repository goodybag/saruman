define(function(require){
  var
    Handlebars = require('handlebars')
  , config     = require('../config')
  , user       = require('../models/user')

  , fixTime = function(val){
      if (!val) return "??";

      val = val.split(':');
      var ampm = "AM";

      if (val[0] >= 12){
        ampm = "PM";

        if (val[0] > 12){
          val[0] -= 12;
        }
      }

      if (val[0] === "00") val[0] = "12";

      return val[0] + ":" + val[1] + " " + ampm;
    }
  ;

  Handlebars.registerHelper('in', function(set, item, options){
    if (set.indexOf(item) > -1) return options.fn(this);
    return options.inverse(this);
  });

  config.groups.forEach(function(group){
    var uppercase = group[0].toUpperCase() + group.substring(1);

    if (group === 'tapin-station') uppercase = "TapinStation";

    Handlebars.registerHelper('if' + uppercase, function(options){
      var attr = user.attributes;
      if (attr && attr.groups && attr.groups.indexOf(group) > -1)
        return options.fn(this);
      else
        return options.inverse(this);
    });
  });


  Handlebars.registerHelper('showHours', function(start, end){
    if (start == end && (typeof start === "string")) return "Closed";

    if (typeof start === "string" && typeof end === "string"){
      if ((parseInt(end.split(':')[0]) - parseInt(start.split(':')[0])) === 24)
        return "All Day";
    }

    return fixTime(start) + " - " + fixTime(end);
  });

  Handlebars.registerHelper('listCuisines', function(items, block){
    var html = "";

    for (var i = 0; i < items.length; i++){
      if (i % 4 === 0 && i < items.length - 1){
        if (i > 0) html += '</div>';
        html += '<div class="row">';
      }
      html += block(items[i]);
      if (i === items.length - 1) html += "</div>";
    }

    return html;
  });
});