/**
 * Table View Component
 */

define(function(require){
  var
    utils     = require('../../../lib/utils')
  , troller   = require('../../../lib/troller')
  , api       = require('../../../lib/api')

  , template  = require('hbt!./table-tmpl')
  , ItemView  = require('./item-view')
  , ItemModel = require('./item-model')
  ;

  return utils.View.extend({
    tagName: 'table'
  , className: 'table table-striped'

  , events: {
      'click .btn-new-item':        'onNewItemClick'
    }

  , initialize: function(options){
      this.options    = options;

      // api.resource to make data calls with
      this.resource   = options.resource;

      // Holds the query parameters for api calls
      this.dataParams = options.dataParams || {};

      // Table headers
      this.headers    = options.headers;

      // Data array if you want
      this.data       = options.data || [];

      // Paginator model
      this.paginator  = options.paginator;

      // Let user specify item view
      this.ItemView   = options.ItemView || ItemView;

      // Let user specify item model
      this.ItemModel  = options.ItemModel || ItemModel;

      return this;
    }

  , render: function(){
      var
        fragmenet = document.createDocumentFragment()
      , this_     = this
      ;

      for (var i = 0, l = this.data.length; i < l; ++i){
        fragment.appendChild(
          new this.ItemView(
            utils.extend({
              model:          new this.ItemModel(this.data[i])
            , trollerPrefix:  this.trollerPrefix
            }, this.getAdditionalViewOptions())
          ).render()
          .on('destroy', function(item){ this_.onItemDestroy(item) })
          .on('copy', function(item){ this_.onItemCopy(item) })
          .$el[0]
        );
      }

      this.$items = this.$items || this.$el.find('.items-list');

      this.$items.html(fragment);

      return this;
    }

  , addNewItem: function(item){
      if (!item.toJSON) item = new this.ItemModel(item);
      this.items.push(item.toJSON());

      return this.$items[0].insertBefore(
        new this_.ItemView(
          utils.extend({
            model: item
          , isNew: true
          }, this_.getAdditionalViewOptions())
        ).render()
          .on('destroy', function(item){ this_.onItemDestroy(item) })
          .on('copy', function(item){ this_.onItemCopy(item) })
          .$el[0]

      , this_.$items[0].childNodes[0]
      );
    }

  , onItemCopy: function(item){
      var this_ = this;

      item = item.clone();

      return this.$items[0].insertBefore(
        new this_.ItemView(
          utils.extend({
            model: item
          , isNew: true
          }, this_.getAdditionalViewOptions())
        ).render()
          .enterEditMode()
          .on('destroy', function(item){ this_.onItemDestroy(item) })
          .on('copy', function(item){ this_.onItemCopy(item) })
          .$el[0]

      , this_.$items[0].childNodes[0]
      );
    }

  , onItemDestroy: function(item){ }

  , fetch: function(callback){
      var this_ = this, args = [];

      api[this.resource].list(this.getDataParams(), function(error, results, meta){
        if (error) return troller.app.error(error), callback && callback(error);

        this_.data = results;

        this_.paginator.setTotal(meta.total);

        this_.render();

        if (callback) callback(null, results, meta);
      });

      return this;
    }

  , filter: function(text){
      this.searchValue = text;
      this.fetch();
    }

  , getDataParams: function(){
      return utils.extend(
        this.dataParams
      , this.paginator.getCurrent()
      , { filter: this.searchValue }
      );
    }

  /**
   * Events
   */

   , onNewItemClick: function(e){
       e.preventDefault();
       this.addNewItem(new this.ItemModel());
     }
  });
});