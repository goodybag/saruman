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
        id: 'New',
        password: null
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

    , checkForManagerModification: function(key, value) {
        if(this.attributes.groups) {
          if(key == 'groups') {
            //if the user's group collection was modified with the
            //'manager' group, automatically promote or demote as needed when
            //the model is saved
            var wasManager = utils.findWhere(this.attributes.groups, {name: 'manager'});
            var isManager = utils.findWhere(value, {name: 'manager'});
            this._promoteToManager = false;
            if(!wasManager && isManager) {
              this._promoteToManager = true;
            }
          }
        }
      }

    , set: function(key, value){
        this.checkForManagerModification(key, value);
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

        //do not save password if it has not changed
        if(!attr.password) {
          delete attr.password;
        }

        var doPromotion = function(cb) {
          if(!this_._promoteToManager) return cb(null);
          var id = this_.get('id');
          if(this_._promoteToManager) {
            console.log('promoting');
            api.users.managers.update(id, {businessId: null, locationId: null}, cb);
            return cb(null);
          }
        };

        if (this.attributes.id && this.attributes.id !== 'New'){
          if (attr.groups){
            for (var i = 0, l = attr.groups.length; i < l; ++i){
              delete attr.groups[i].metaTotal;
            }
          }
          api.users.update(this.attributes.id, attr, function(error, result, extra) {
            if(error) return callback(error);
            return doPromotion(function(error) {
              if(error) return callback(error);
              return callback(null, result, extra);
            });
          });
        }
        else {
          api.users.create(attr, function(error, result, extra){
            if (error) return callback && callback(error);
            this_.set('id', result.id);
            return doPromotion(function(error) {
              if(error) return callback && callback(error);
              return callback && callback(null, result, extra);
            });
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
