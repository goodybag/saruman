define(function(require){
  var
    $         = require('jquery')
  , async     = require('async')
  , _         = require('underscore') || window._

  , config    = require('../config')
  , utils     = _.extend({}, _, async)
  ;

  require('backbone');
  require('select2');
  require('bootstrap-dropdown');

  utils.dom = $;

  utils.Backbone   = Backbone;
  utils.Events     = Backbone.Events;
  utils.Router     = Backbone.Router;
  utils.Model      = Backbone.Model;
  utils.View       = Backbone.View;
  utils.Collection = Backbone.Collection;
  utils.History    = Backbone.History;

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
    , crossDomain: true
    , success: function(results){
        callback(results.error, results.data, results.meta);
      }
    , error: function(error){
        callback(error);
      }
    };

    if (data) ajax.data = data;

    $.ajax(ajax);
  };

  utils.queryParams = function(data){
    if (typeof data !== "object") return "";
    var params = "?";
    for (var key in data){
      params += key + "=" + data[key] + "&";
    }
    return params.substring(0, params.length - 1);
  };

  return utils;
});