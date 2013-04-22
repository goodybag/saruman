define(function(require){
  var
    utils   = require('../lib/utils')
  , api     = require('../lib/api')
  , config  = require('../config')

  , Model = utils.Model.extend({
      acceptable: [
        'id'
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

    , makeNew: function(){
        this.set('id', 'New');
        return this;
      }

    , set: function(key, value){
        if (typeof key === "object"){
          for (var k in key)
            if (this.acceptable.indexOf(k) === -1) delete key[k];
        } else if (this.acceptable.indexOf(key) === -1) return this;

        if (this.attributes[key] != value && key != 'id' && typeof key !== "object"){
          this._changed.push(value);
          this.changed_[key] = value;
        }

        utils.Model.prototype.set.apply(this, arguments);
      }

    , push: function(key){
        var args = Array.prototype.slice.call(arguments, 1);
        Array.prototype.push.apply(this.attributes[key], args);
        this._changed.push(this.attributes[key]);
        this.changed_[key] = this.attributes[key];
        return this;
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

        if (this.attributes.id && this.attributes.id !== 'New'){
          api[this.resource].update(this.attributes.id, attr, callback);
        } else {
          api[this.resource].create(attr, function(error, result){
            if (error) return callback && callback(error);

            this_.set('id', result.id);

            if (callback) callback(null, result)
          });
        }

        return this;
      }

    , delete: function(callback){
        api[this.resource].delete(this.attributes.id, callback);
      }
    })
  ;

  return Model;
});