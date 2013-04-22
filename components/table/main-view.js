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
  ;

  return utils.View.extend({
    tagName:    'table'
  , className:  'table table-striped'

  , events: {
      'click .btn-new-item':        'onNewItemClick'
    }

  , initialize: function(options){
      options = options || {};

      // Yeah, the template
      this.template   = options.template || template;

      // Table headers
      this.headers    = options.headers || {};

      // Data array if you want
      this.data       = options.data || [];

      // Paginator model
      this.paginator  = options.paginator;

      // Let user specify item view
      this.ItemView   = options.ItemView || ItemView;

      // Require that the user specify item model
      this.ItemModel  = options.ItemModel;

      return this;
    }

  , render: function(){
      var
        fragment  = document.createDocumentFragment()
      , this_     = this
      ;

      for (var i = 0, l = this.data.length; i < l; ++i){
        fragment.appendChild(
          new this.ItemView(
            utils.extend({
              model:          new this.ItemModel(this.data[i], this.getAdditionalModelOptions())
            , trollerPrefix:  this.trollerPrefix
            }, this.getAdditionalViewOptions())
          ).render()
          .on('destroy', function(item){ this_.onItemDestroy(item) })
          .on('copy',    function(item){ this_.onItemCopy(item) })
          .el
        );
      }

      this.$el.html(
        this.template({
          model:    this.model ? this.model.toJSON() : null
        , headers:  this.headers
        })
      );

      this.$items = this.$el.find('.items-list');

      this.$items.html(fragment);

      return this;
    }

  , setItems: function(data){
      this.data = data;
    }

  , addNewItem: function(item){
      var this_ = this;

      if (!item) item = new this.ItemModel({}, this.getAdditionalModelOptions());
      if (!item.toJSON) item = new this.ItemModel(item, this.getAdditionalModelOptions());

      this.data.push(item.toJSON());

      return this.$items[0].insertBefore(
        new this.ItemView(
          utils.extend({
            model: item
          , isNew: true
          }, this.getAdditionalViewOptions())
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

  , getAdditionalViewOptions: function(){ return {}; }

  , getAdditionalModelOptions: function(){ return {}; }

  , onItemDestroy: function(item){ }

  // , fetch: function(callback){
  //     var this_ = this, args = [];

  //     api[this.resource].list(this.getDataParams(), function(error, results, meta){
  //       if (error) return troller.app.error(error), callback && callback(error);

  //       this_.data = results;

  //       this_.paginator.setTotal(meta.total);

  //       this_.render();

  //       if (callback) callback(null, results, meta);
  //     });

  //     return this;
  //   }

  // , filter: function(text){
  //     this.searchValue = text;
  //     this.fetch();
  //   }

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
       this.addNewItem();
     }
  });
});