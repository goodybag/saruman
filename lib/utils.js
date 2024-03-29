define(function(require){
  var
    $         = require('jquery')
  , async     = require('async')
  , Modal     = require('bootstrap-modal')
  , Spinner   = require('spin-js').Spinner
  , _         = require('underscore') || window._

  , config    = require('../config')
  , utils     = _.extend({}, _, async)
  ;

  require('backbone');
  require('select2');
  require('bootstrap-dropdown');

  utils.dom = $;
  utils.domready = $;

  utils.Modal = Modal;

  utils.Spinner = Spinner;

  utils.Backbone   = Backbone;
  utils.Events     = Backbone.Events;
  utils.Router     = Backbone.Router;
  utils.Model      = Backbone.Model;
  utils.View       = Backbone.View;
  utils.Collection = Backbone.Collection;
  utils.History    = Backbone.History;

  // utils.Resource = (function(){
  //   var constructor = function(resource, options){
  //     // /consumers/:userId/collections/:collectionId/products
  //     this.resource = resource;

  //     this.Model = options.Model;

  //     this.items = [];
  //     this.index = {};

  //     this.defaultParams = options.defaultParams || {};

  //     this.params = {};
  //   };

  //   utils.extend(constructor.prototype, utils.Events);

  //   constructor.prototype.get = function(id, callback){
  //     if (this.index[id]) return callback(null, this.items[this.index[id]]);

  //     this.resource.get(id, function(error, result){

  //     });
  //   };

  //   contructor.prototype.list = function(params, callback){
  //     if (typeof params == 'function'){
  //       callback = params;
  //       params = {};
  //     }

  //     this.params = utils.extend(this.defaultParams, params);

  //     this.resource.list
  //   };

  //   return constructor;
  // });

  utils.md5 = (function () {
  return  function (string) {

    function cmn(q, a, b, x, s, t) {
      a = add32(add32(a, q), add32(x, t));
      return add32((a << s) | (a >>> (32 - s)), b);
    }


    function ff(a, b, c, d, x, s, t) {
      return cmn((b & c) | ((~b) & d), a, b, x, s, t);
    }

    function gg(a, b, c, d, x, s, t) {
      return cmn((b & d) | (c & (~d)), a, b, x, s, t);
    }

    function hh(a, b, c, d, x, s, t) {
      return cmn(b ^ c ^ d, a, b, x, s, t);
    }

    function ii(a, b, c, d, x, s, t) {
      return cmn(c ^ (b | (~d)), a, b, x, s, t);
    }



    function md5cycle(x, k) {
      var a = x[0], b = x[1], c = x[2], d = x[3];

      a = ff(a, b, c, d, k[0], 7, -680876936);
      d = ff(d, a, b, c, k[1], 12, -389564586);
      c = ff(c, d, a, b, k[2], 17,  606105819);
      b = ff(b, c, d, a, k[3], 22, -1044525330);
      a = ff(a, b, c, d, k[4], 7, -176418897);
      d = ff(d, a, b, c, k[5], 12,  1200080426);
      c = ff(c, d, a, b, k[6], 17, -1473231341);
      b = ff(b, c, d, a, k[7], 22, -45705983);
      a = ff(a, b, c, d, k[8], 7,  1770035416);
      d = ff(d, a, b, c, k[9], 12, -1958414417);
      c = ff(c, d, a, b, k[10], 17, -42063);
      b = ff(b, c, d, a, k[11], 22, -1990404162);
      a = ff(a, b, c, d, k[12], 7,  1804603682);
      d = ff(d, a, b, c, k[13], 12, -40341101);
      c = ff(c, d, a, b, k[14], 17, -1502002290);
      b = ff(b, c, d, a, k[15], 22,  1236535329);

      a = gg(a, b, c, d, k[1], 5, -165796510);
      d = gg(d, a, b, c, k[6], 9, -1069501632);
      c = gg(c, d, a, b, k[11], 14,  643717713);
      b = gg(b, c, d, a, k[0], 20, -373897302);
      a = gg(a, b, c, d, k[5], 5, -701558691);
      d = gg(d, a, b, c, k[10], 9,  38016083);
      c = gg(c, d, a, b, k[15], 14, -660478335);
      b = gg(b, c, d, a, k[4], 20, -405537848);
      a = gg(a, b, c, d, k[9], 5,  568446438);
      d = gg(d, a, b, c, k[14], 9, -1019803690);
      c = gg(c, d, a, b, k[3], 14, -187363961);
      b = gg(b, c, d, a, k[8], 20,  1163531501);
      a = gg(a, b, c, d, k[13], 5, -1444681467);
      d = gg(d, a, b, c, k[2], 9, -51403784);
      c = gg(c, d, a, b, k[7], 14,  1735328473);
      b = gg(b, c, d, a, k[12], 20, -1926607734);

      a = hh(a, b, c, d, k[5], 4, -378558);
      d = hh(d, a, b, c, k[8], 11, -2022574463);
      c = hh(c, d, a, b, k[11], 16,  1839030562);
      b = hh(b, c, d, a, k[14], 23, -35309556);
      a = hh(a, b, c, d, k[1], 4, -1530992060);
      d = hh(d, a, b, c, k[4], 11,  1272893353);
      c = hh(c, d, a, b, k[7], 16, -155497632);
      b = hh(b, c, d, a, k[10], 23, -1094730640);
      a = hh(a, b, c, d, k[13], 4,  681279174);
      d = hh(d, a, b, c, k[0], 11, -358537222);
      c = hh(c, d, a, b, k[3], 16, -722521979);
      b = hh(b, c, d, a, k[6], 23,  76029189);
      a = hh(a, b, c, d, k[9], 4, -640364487);
      d = hh(d, a, b, c, k[12], 11, -421815835);
      c = hh(c, d, a, b, k[15], 16,  530742520);
      b = hh(b, c, d, a, k[2], 23, -995338651);

      a = ii(a, b, c, d, k[0], 6, -198630844);
      d = ii(d, a, b, c, k[7], 10,  1126891415);
      c = ii(c, d, a, b, k[14], 15, -1416354905);
      b = ii(b, c, d, a, k[5], 21, -57434055);
      a = ii(a, b, c, d, k[12], 6,  1700485571);
      d = ii(d, a, b, c, k[3], 10, -1894986606);
      c = ii(c, d, a, b, k[10], 15, -1051523);
      b = ii(b, c, d, a, k[1], 21, -2054922799);
      a = ii(a, b, c, d, k[8], 6,  1873313359);
      d = ii(d, a, b, c, k[15], 10, -30611744);
      c = ii(c, d, a, b, k[6], 15, -1560198380);
      b = ii(b, c, d, a, k[13], 21,  1309151649);
      a = ii(a, b, c, d, k[4], 6, -145523070);
      d = ii(d, a, b, c, k[11], 10, -1120210379);
      c = ii(c, d, a, b, k[2], 15,  718787259);
      b = ii(b, c, d, a, k[9], 21, -343485551);

      x[0] = add32(a, x[0]);
      x[1] = add32(b, x[1]);
      x[2] = add32(c, x[2]);
      x[3] = add32(d, x[3]);

    }


    function md51(s) {
      txt = '';
      var n = s.length,
      state = [1732584193, -271733879, -1732584194, 271733878], i;
      for (i=64; i<=n; i+=64) {
        md5cycle(state, md5blk(s.substring(i-64, i)));
      }
      s = s.substring(i-64);
      var tail = [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0], sl=s.length;
      for (i=0; i<sl; i++)  tail[i>>2] |= s.charCodeAt(i) << ((i%4) << 3);
      tail[i>>2] |= 0x80 << ((i%4) << 3);
      if (i > 55) {
        md5cycle(state, tail);
        i=16;
        while (i--) { tail[i] = 0 }
  //      for (i=0; i<16; i++) tail[i] = 0;
      }
      tail[14] = n*8;
      md5cycle(state, tail);
      return state;
    }

    /* there needs to be support for Unicode here,
     * unless we pretend that we can redefine the MD-5
     * algorithm for multi-byte characters (perhaps
     * by adding every four 16-bit characters and
     * shortening the sum to 32 bits). Otherwise
     * I suggest performing MD-5 as if every character
     * was two bytes--e.g., 0040 0025 = @%--but then
     * how will an ordinary MD-5 sum be matched?
     * There is no way to standardize text to something
     * like UTF-8 before transformation; speed cost is
     * utterly prohibitive. The JavaScript standard
     * itself needs to look at this: it should start
     * providing access to strings as preformed UTF-8
     * 8-bit unsigned value arrays.
     */
    function md5blk(s) {    /* I figured global was faster.   */
      var md5blks = [], i;  /* Andy King said do it this way. */
      for (i=0; i<64; i+=4) {
      md5blks[i>>2] = s.charCodeAt(i)
      + (s.charCodeAt(i+1) << 8)
      + (s.charCodeAt(i+2) << 16)
      + (s.charCodeAt(i+3) << 24);
      }
      return md5blks;
    }

    var hex_chr = '0123456789abcdef'.split('');

    function rhex(n)
    {
      var s='', j=0;
      for(; j<4; j++) s += hex_chr[(n >> (j * 8 + 4)) & 0x0F] + hex_chr[(n >> (j * 8)) & 0x0F];
      return s;
    }

    function hex(x) {
      var l=x.length;
      for (var i=0; i<l; i++) x[i] = rhex(x[i]);
      return x.join('');
    }

    /* this function is much faster,
    so if possible we use it. Some IEs
    are the only ones I know of that
    need the idiotic second function,
    generated by an if clause.  */

    function add32(a, b) {
      return (a + b) & 0xFFFFFFFF;
    }

    if (hex(md51("hello")) != "5d41402abc4b2a76b9719d911017c592") {
      function add32(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF),
        msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
      }
    }

    return hex(md51(string));
  }
})();

  utils.removeFromArray = function(set, item, key, unique){
    if (typeof item === "object" && !key) return;

    var indices = [], result;
    if (typeof item === "object"){
      for (var i = 0, l = set.length; i < l; ++i){
        if (set[i][key] === item[key]){
          indices.push(i - indices.length);
          if (!!unique) break;
        }
      }
    } else {
      for (var i = 0, l = set.length; i < l; ++i){
        if (set[i] === item){
          indices.push(i - indices.length);
          if (!!unique) break;
        }
      }
    }

    for (var i = 0, l = indices.length; i < l; ++i){
      result = utils.removeAtIndex(set, indices[i]);
    }

    return result;
  };

  utils.removeAtIndex = function(set, index){
    var rest = set.slice(index + 1);
    set.length = index;
    set.push.apply(set, rest);
    return set;
  };

  utils.guid = function(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r&0x3 | 0x8);
        return v.toString(16);
    });
  };

  utils.noop = function(){};

  utils.api = {};

  utils.api.get = function(url, data, callback){
    utils.api.request('get', url, data, callback);
  };

  utils.api.post = function(url, data, callback){
    utils.api.request('post', url, data, callback);
  };

  utils.api.patch = function(url, data, callback){
    utils.api.request('patch', url, data, callback);
  };

  utils.api.update = function(url, data, callback){
    utils.api.request('patch', url, data, callback);
  };

  utils.api.del = function(url, data, callback){
    utils.api.request('del', url, data, callback);
  };

  utils.api.request = function(method, url, data, callback){
    switch (method){
      case "get":   method = "GET"; break;
      case "post":  method = "POST"; break;
      case "del":   method = "DELETE"; break;
      case "put":   method = "PUT"; break;
      case "patch": method = "PUT"; break;
    }

    url = config.apiUrl + url;

    if (typeof data === "function"){
      callback = data;
      data = {};
    }

    if (method === "GET"){
      url += utils.queryParams(data);
      data = null;
    }

    var ajax = {
      type: method
    , url: url
    , xhrFields: {
        withCredentials: true
      }
    , headers: {
        'Content-Type': 'application/json'
      , application: 'Merlin 1.0.0'
      }
    , crossDomain: true
    , success: function(results){
        results = results || {};

        callback && callback(results.error, results.data, results.meta);
      }
    , error: function(error, results, res, r){
        callback && callback(error.responseText ? JSON.parse(error.responseText).error : error);
      }
    };

    if (data) ajax.data = JSON.stringify(data);

    $.ajax(ajax);
  };

  utils.queryParams = function(data){
    if (typeof data !== "object") return "";
    var params = "?";
    for (var key in data){
      if (Array.isArray(data[key])){
        for (var i = 0, l = data[key].length; i < l; ++i){
          params += key + "[]=" + data[key][i] + "&";
        }
      } else {
        params += key + "=" + data[key] + "&";
      }
    }
    return params.substring(0, params.length - 1);
  };

  return utils;
});