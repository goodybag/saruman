define(function(require){
  var
    utils   = require('../lib/utils')
  , api     = require('../lib/api')
  , config  = require('../config')

  , Model = utils.Model.extend({
      acceptable: [
        'id'
      , 'email'
      , 'password'
      , 'singlyId'
      , 'singlyAccessToken'
      , 'groups'
      , 'cardId'
      ]

    , defaults: {
        id: 'New'
      }

    , initialize: function(attributes){
        for (var key in this.attributes){
          if (this.acceptable.indexOf(key) === -1)
            delete this.attributes[key];
        }
      }

    , toJSON: function(){
        return this.attributes;
      }

    , makeNewUser: function(){
        this.set('email', 'user-' + utils.guid() + '@generated.goodybag.com');
        if (!this.attributes.groups) this.set('groups', []);
        this.set('password', utils.guid());
        this.set('id', 'New');
        return this;
      }

    , generateEmailFromId: function(){
        this.set('email', 'user-' + this.attributes.id + '@generated.goodybag.com')
      }

    , set: function(key, value){
        if (typeof key === "object"){
          for (var k in key)
            if (this.acceptable.indexOf(k) === -1) delete key[k];
        } else if (this.acceptable.indexOf(key) === -1) return this;

        utils.Model.prototype.set.apply(this, arguments);
      }

    , save: function(data, callback){
        if (typeof data === "function"){
          callback = data;
          data = null;
        }

        if (data) this.set(data);

        var attr = utils.clone(this.attributes), this_ = this;
        delete attr.id;

        if (this.attributes.id && this.attributes.id !== 'New'){
          if (attr.groups){
            for (var i = 0, l = attr.groups.length; i < l; ++i){
              delete attr.groups[i].metaTotal;
            }
          }
          api.users.update(this.attributes.id, attr, callback);
        }
        else {
          api.users.create(attr, function(error, result){
            if (error) return callback && callback(error);

            this_.set('id', result.id);

            if (callback) callback(null, result)
          });
        }

        return this;
      }

    , delete: function(){
        api.users.delete(this.attributes.id);
      }
    })
  ;

  return Model;
});