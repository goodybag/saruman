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
        return this.attributes;
      }

    , makeNewUser: function(){
        this.set('email', 'consumer-' + utils.guid() + '@generated.goodybag.com');
        this.set('screenName', null);
        this.set('cardId', null);
        this.set('password', 'password');
        this.set('id', 'New');
        return this;
      }

    , generateEmailFromId: function(){
        this.set('email', 'consumer-' + this.attributes.id + '@generated.goodybag.com')
        return this;
      }

    , generatePasswordFromId: function(){
        this.set('password', 'password' + this.get('id'));
        return this;
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
          var password = attr.password;
          delete attr.password;

          utils.parallel({
            consumers: function(done){
              api.consumers.update(this_.attributes.id, attr, done);
            }

          , users: function(done){
              api.users.update(this_.attributes.id, { password: password }, done);
            }
          }, callback);
        }
        else {
          api.consumers.create(attr, function(error, result){
            if (error) return callback && callback(error);

            this_.set('id', result.id);

            if (callback) callback(null, result)
          });
        }

        return this;
      }

    , delete: function(){
        api.consumers.delete(this.attributes.id);
      }
    })
  ;

  return Model;
});