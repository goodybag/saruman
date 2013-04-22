define(function(require){
  var
    utils   = require('../lib/utils')
  , troller = require('../lib/troller')
  , api     = require('../lib/api')
  , config  = require('../config')
  , Base    = require('./base')

  , getCreateTagFunction = function(tag, businessId){
      return function(done){
        api.businesses.productTags.create(businessId, { tag: tag }, function(error, result, meta){
          done(error, result);
        });
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
      , tags:                         []
      , categories:                   []
      }

    , resource: 'products'

    , initialize: function(attributes, options){
      console.log(options);
        Base.prototype.initialize.call(this, attributes, options);

        this.allTags = options.allTags;
        this.allCategories = options.allCategories;
      }

      // Override save function to ensure tags get saved first :(
    , save: function(data, callback){
        if (typeof data === "function"){
          callback = data;
          data = null;
        }

        if (data) this.set(data);

        if (!this.getChanged().tags)
          return Base.prototype.save.call(this, callback);

        var toBeCreated = {}, this_ = this, deficit = 0;

        for (var i = 0, tags = this.attributes.tags, l = tags.length; i < l; ++i){
          // Correct format
          if (typeof tag === 'number'){
            tags[i - deficit] = tags[i];
            continue;
          }

          // Record format
          if (typeof tag === 'object' && tag.id){
            tags[i - deficit] = tags[i].id;
            continue;
          }

          // String tag, if it already exists, use that record
          if (typeof tags[i] == 'string' && this_.allTags[tags[i]] && this_.allTags[tags[i]].id){
            tags[i - deficit] = this_.allTags[tags[i]].id
            continue;
          }

          // Doesn't exist, need to create it first
          toBeCreated[tags[i]] = getCreateTagFunction(tags[i], this_.get('businessId'));

          // Increment deficit to construct correct tags array
          deficit++;
        }

        // Remove bad records
        while (deficit-- > 0) tags.pop();

        utils.parallel(toBeCreated, function(error, results){
          if (error) return callback ? callback(error) : troller.error(error);

          var tagsCreated = false;

          for (var key in results){
            tagsCreated = true;

            // Index  tag by name
            this_.allTags[key] = {
              tag:  key
            , id:   results[key].id
            };

            // Index tag by id
            this_.allTags[this_.allTags[key].id] = this_.allTags[key];

            // Also keep an array set to be used
            this_.allTags._tags.push( this_.allTags[key].tag );

            // Also push to local models tags for saving in api
            this_.push('tags', this_.allTags[key].id);

            // ALSO, we need to trigger a tags created event later
            // So save the ones that were created
            // Actually, We'll see if we REALLY need to save them
            // It might suffice to just trigger the event
            // If not, then we can save them and pass them in the event
            // We can replace the tagsCreated bool with an array
          }

          // Done saving tags, now onto saving the damn product
          Base.prototype.save.call(this_, function(error, result){
            // Once the product has saved, we need to revert our product model
            // Back to something where we can use
            this_.attributes.tags = this_.get('tags').map(function(tag){
              if (typeof tag == 'number') return this_.allTags[tag];
              if (typeof tag == 'string') return this_.allTags[tag];
              return tag;
            });

            this_.attributes.categories = this_.get('categories').map(function(cat){
              if (typeof cat == 'number') return this_.allCategories._categories[cat];
              return cat;
            });

            if (error) return callback ? callback(error) : troller.error(error);

            if (callback) callback(null, result);

            // Trigger tags created to let views
            if (tagsCreated) this_.trigger('tag:created');
          });
        });
      }
    })
  ;

  return Model;
});