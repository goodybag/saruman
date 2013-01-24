define(function(require){
  var
    Handlebars = require('handlebars')

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

      return val[0] + ":" + val[1] + " " + ampm;
    }
  ;

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