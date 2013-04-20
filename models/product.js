define(function(require){
  var
    utils   = require('../lib/utils')
  , troller = require('../lib/troller')
  , api     = require('../lib/api')
  , config  = require('../config')
  , Base    = require('./base')

  , getCreateTagFunction = function(tag, businessId){
      return function(done){
        api.businesses.productTags.create(businessId, { tag: tag }, done);
      };
    }

  , Model = Base.extend({
      acceptable: [
        'id'
      , 'name'
      , 'description'
      , 'price'
      , 'tags'
      , 'categories'
      , 'photoUrl'
      , 'businessId'
      ]

    , defaults: {
        id:                           'New'
      , name:                         'New Product'
      , price:                        0
      }

    , resource: 'products'

    , initialize: function(attributes, options){
        Base.prototype.initialize.call(this, attributes, options);

        this.allTags = options.allTags;
      }

      // Override save function to ensure tags get saved first :(
    , save: function(data, callback){
        if (typeof data === "function"){
          callback = data;
          data = null;
        }

        if (data) this.set(data);

        var toBeCreated = {}, this_ = this;

        this.set('tags', this.attributes.tags.map(function(tag){
          // Correct format
          if (typeof tag === 'object' && tag.name) return tag;

          // String tag, if it already exists, use that record
          if (this_.allTags[tag]) return this_.allTags[tag];

          // Doesn't exist, need to create it first
          toBeCreated[tag] = getCreateTagFunction(tag, this_.get('businessId'));
        }));

        utils.parallel(toBeCreated, function(error, results){
          if (error) return callback ? callback(error) : troller.error(error);

          for (var key in results){
            this_.allTags[key] = {
              tag:  key
            , id:   results[key].id
            }

            this_.allTags._tags.push( this_.allTags[key] );
            this_.get('tags').push( this_.allTags[key] );

            this_.trigger('tag:created');
          }

          // Done saving tags, now onto saving the damn product
          Base.prototype.save.call(this_, callback);
        });
      }
    })
  ;

  return Model;
});