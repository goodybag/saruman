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
      ]

    , defaults: {
        id:             'New'
      }

    , constructor: function(){
        this.changed_ = {};
        this._changed = [];

        utils.Model.prototype.constructor.apply(this, arguments);
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

        return this;
      }

    , toJSON: function(){
        return this.attributes;
      }

    , makeNewUser: function(){
        this.set('email', this.type + utils.guid() + '@generated.goodybag.com');
        this.set('password', utils.guid().replace(/\-/g, ''));
        this.set('id', 'New');
        return this;
      }

    , generateEmailFromId: function(){
        this.set('email', this.type + '-' + this.attributes.id + '@generated.goodybag.com')
        this.set('password', utils.md5('chipotle-' + this.attributes.id));
      }

    , set: function(key, value){
        if (typeof key === "object"){
          for (var k in key)
            if (this.acceptable.indexOf(k) === -1) delete key[k];
        } else if (this.acceptable.indexOf(key) === -1) return this;
console.log('set', key, value);
        if (this.attributes[key] != value && key != 'id' && typeof key !== "object"){
          this._changed.push(value);
          this.changed_[key] = value;
        }

        utils.Model.prototype.set.apply(this, arguments);
      }

    , getChanged: function(){
        return this.changed_;
      }

    , save: function(data, callback){
        if (typeof data === "function"){
          callback = data;
          data = null;
        }

        if (data) this.set(data);

        var attr = utils.clone(this.getChanged()), this_ = this;

        // Sanitize what we're sending to the server
        if (attr.locationId == null) delete attr.locationId;
        if (attr.businessId == null) delete attr.businessId;

        if (this.attributes.id && this.attributes.id !== 'New'){

          var
            password  = attr.password
          , email     = attr.email

          , updates = {
              regular: function(done){
                var fieldsToUpdate = this_._changed.length;

                if (password) delete attr.password, fieldsToUpdate--;
                if (email)    delete attr.email, fieldsToUpdate--;

                if (fieldsToUpdate <= 0) return done();

                api[this_.type + 's'].update(this_.attributes.id, attr, done);
              }
            }
          ;

          if (password || email){
            updates.user = function(done){
              var $update = {};
              if (password) $update.password  = password;
              if (email)    $update.email     = email;

              api.users.update(this_.attributes.id, $update, done);
            };
          }

          utils.parallel(updates, function(error, results){
            if (error) return callback(error);

            this_.changed_ = {};
            this_._changed = [];

            callback(null, this_.attributes);
          });
        } else {
          api[this.type + 's'].create(attr, function(error, result){
            if (error) return callback && callback(error);

            this_.set('id', result.id);

            if (callback) callback(null, result)
          });
        }

        return this;
      }

    , delete: function(){
        api[this.type + 's'].delete(this.attributes.id);
      }
    })
  ;

  return Model;
});