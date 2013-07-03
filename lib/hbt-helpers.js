define(function(require){
  var
    Handlebars = require('handlebars')
  , config     = require('../config')
  , utils      = require('./utils')
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

  Handlebars.registerHelper('forObj', function(obj, block){
    var html = "";
    for (var key in obj){
      html += block({ key: key, value: obj[key] });
    }
    return html;
  });

  Handlebars.registerHelper('filepicker', function(url, width, height){
    if (!url) url = config.defaults.photoUrl;
    else url = url.replace('www', 'cdn');

    if (url.indexOf('convert') == -1)
      url += "/convert?cache=true&fit=crop"

    url += "&w=" + (width   || 100);
    url += "&h=" + (height  || 100);

    return url;
  });

  Handlebars.registerHelper('money', function(value){
    value = value || 0;
    return parseFloat(value / 100, 10).toFixed(2);
  });

  Handlebars.registerHelper('defaultBusinessLogo', function(url){
    return url || config.defaults.business.logoUrl;
  });

  Handlebars.registerHelper('eq', function(a, b, options){
    return options[a == b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('lt', function(a, b, options){
    return options[a < b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('lte', function(a, b, options){
    return options[a <= b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('gt', function(a, b, options){
    return options[a > b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('gte', function(a, b, options){
    return options[a >= b ? 'fn' : 'inverse'](this);
  });

  Handlebars.registerHelper('truncate', function(str, max){
    if (!str) return "";
    if (str.length <= max) return str;
    return str.substring(0, max) + "...";
  });

  Handlebars.registerHelper('in', function(set, item, options){
    if (typeof item == 'object' && set.length > 0 && typeof set[0] == 'object' && item.id && set[0].id){
      for (var i = 0, l = set.length; i < l; ++i){
        if (set[i].id == item.id){
          return options.fn(this);
        }
      }
      return options.inverse(this);

    } else if (set.length > 0 && typeof set[0] == 'object' && set[0].id){
      for (var i = 0, l = set.length; i < l; ++i){
        if (set[i].id == item){
          return options.fn(this);
        }
      }
      return options.inverse(this);
    }

    if (set.indexOf(item) > -1) return options.fn(this);
    return options.inverse(this);
  });

  config.groups.forEach(function(group){
    var uppercase = group[0].toUpperCase() + group.substring(1);

    if (group === 'tapin-station') uppercase = "TapinStation";

    Handlebars.registerHelper('if' + uppercase, function(options){
      var attr = user.attributes;
      return options[(attr && attr.groups && attr.groups.indexOf(group) > -1) ? 'fn' : 'inverse'](this)
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

  Handlebars.registerHelper('empty', function(item) {
    return item || ' -- ';
  });

  Handlebars.registerHelper('productImage', function(url, size) {
    return utils.getSizedPhotoUrl(url, size);
  });

});
