define(function(require){
  var
    utils   = require('../lib/utils')
  , api     = require('../lib/api')
  , config  = require('../config')

  , Model = utils.Model.extend({
      acceptable: [
        'id'
      , 'email'
      , 'firstName'
      , 'lastName'
      , 'screenName'
      , 'cardId'
      , 'avatarUrl'
      ]

    , defaults: {
        id: 'New'
      , avatarUrl: config.defaults.avatarUrl
      }

    , initialize: function(attributes){
        for (var key in this.attributes){
          if (this.acceptable.indexOf(key) === -1)
            delete this.attributes[key];
        }
      }

    , toJSON: function(){
        return attributes;
      }

    , set: function(key, value){
        if (typeof key === "object"){
          for (var k in key) this.set(k, key[k]);
          return this;
        }

        if (this.acceptable.indexOf(key) === -1) return this;

        utils.Model.prototype.set.apply(this, arguments);
      }

    , save: function(data, callback){
        if (typeof data === "function"){
          callback = data;
          data = null
        }

        if (data) this.set(data);

        var attr = utils.clone(this.attributes), this_ = this;
        delete attr.id;

        if (this.attributes.id && this.attributes.id !== 'New')
          api.consumers.update(this.attributes.id, attr, callback);
        else {
          api.consumers.create(attr, function(error, result){
            if (error) return callback && callback(error);


          });
        }

        return this;
      }

    , delete
    })
  ;

  return Model;
});