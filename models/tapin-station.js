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
      , 'userId'
      , 'locationId'
      , 'businessId'
      , 'loyaltyEnabled'
      , 'galleryEnabled'
      ]

    , defaults: {
        id:             'New'
      , locationId:     null
      , businessId:     null
      , loyaltyEnabled: true
      , galleryEnabled: true
      }

    , initialize: function(attributes){
        if (attributes && attributes.userId){
          this.attributes.id = attributes.userId;
          delete this.attributes.userId;
        }

        for (var key in this.attributes){
          if (this.acceptable.indexOf(key) === -1)
            delete this.attributes[key];
        }
      }

    , toJSON: function(){
        return this.attributes;
      }

    , makeNewUser: function(){
        this.set('email', 'tapin-station-' + utils.guid() + '@generated.goodybag.com');
        this.set('password', utils.guid().replace(/\-/g, ''));
        this.set('id', 'New');
        return this;
      }

    , generateEmailFromId: function(){
        this.set('email', 'tapin-station-' + this.attributes.id + '@generated.goodybag.com')
        this.set('password', utils.md5('chipotle-' + this.attributes.id));
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

        // Sanitize what we're sending to the server
        if (attr.locationId == null) delete attr.locationId;
        if (attr.businessId == null) delete attr.businessId;

        if (this.attributes.id && this.attributes.id !== 'New'){
          var
            password = attr.password

          , updates = {
              regular: function(done){
                if (password) delete attr.password;

                api.tapinStations.update(this_.attributes.id, attr, done);
              }
            }
          ;

          if (password){
            updates.password = function(done){
              api.users.update(this_.attributes.id, { password: password }, done);
            };
          }

          utils.parallel(updates, callback);
        } else {
          api.tapinStations.create(attr, function(error, result){
            if (error) return callback && callback(error);

            this_.set('id', result.id);

            if (callback) callback(null, result)
          });
        }

        return this;
      }

    , delete: function(){
        api.tapinStations.delete(this.attributes.id);
      }
    })
  ;

  return Model;
});