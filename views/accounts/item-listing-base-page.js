define(function(require){
  var
    Page              = require('../page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')

  , Views = {
      Paginator       : require('../paginator')
    }
  ;

  return Page.extend({
    className: 'page page-items'

  , events: {
      'keyup .items-search':            'onItemsSearchKeyUp'
    , 'click .btn-new-item':            'onNewItemBtnClick'
    }

  , fetchItems: function(){
      var
        this_   = this
      , paging  = this.paginator.getCurrent()
      , options = utils.extend({
          limit : paging.limit
        , offset: paging.offset
        }, this.getAdditionalFetchItemParams())
      , filter  = this.$search.val()
      ;

      if (filter) options.filter = filter;

      api[this_.type].list(options, function(error, items, meta){
        if (error) return alert(error.message);

        this_.paginator.setTotal(meta.total);
        this_.items = items;

        this_.renderItems();
      });

      return this;
    }

  , renderItems: function(items, callback){
      if (typeof items === "function"){
        callback = items;
        items = [];
      } else items = items || this.items || [];

      var
        fragment  = document.createDocumentFragment()
      , this_     = this
      ;

      for (var i = 0, len = items.length, view; i < len; i++){
        fragment.appendChild(
          new this.ItemView(
            utils.extend({
              model: new this.ItemModel(items[i])
            }, this.getAdditionalViewOptions())
          ).render()
          .on('destroy', function(item){ this_.onItemDestroy(item) })
          .on('copy', function(item){ this_.onItemCopy(item) })
          .$el[0]
        );
      }
      this.$itemsList.html(fragment);

      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();

      // Insert paginators
      if (this.paginator.maxPages <= 1){
        if (callback) callback();
        return this;
      }

      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();
      this.$el.find('.items-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('.items-paginator-bottom').append(this.children.paginatorBottom.$el);

      if (callback) callback();

      return this;
    }

  , render: function(){
      this.$el.html(this.template());

      this.$itemsList = this.$el.find('.items-list');
      this.$search = this.$el.find('.items-search');

      this.renderItems();

      this.trigger('rendered');

      return this;
    }

  , getAdditionalViewOptions: function(){ return {}; }
  , getAdditionalFetchItemParams: function(){ return {}; }

  , onItemCopy: function(item){
      var this_ = this;

      item = item.clone();
      item.set('id', 'New');

      return this_.$itemsList[0].insertBefore(
        new this_.ItemView(
          utils.extend({
            model: item
          , isNew: true
          }, this_.getAdditionalViewOptions())
        ).render()
          .enterEditMode()
          .on('destroy',  function(item){ this_.onItemDestroy(item) })
          .on('copy',     function(item){ this_.onItemCopy(item) })
          .$el[0]

      , this_.$itemsList[0].childNodes[0]
      );
    }

  , onItemDestroy: function(item){
      if (!item || item.id === "New") return;
      this.items = utils.removeFromArray(this.items, item, 'id', true);
      this.renderItems();
    }

  , onNewUserBtnClick: function(e){
      var
        this_ = this
      , item  = new this.ItemModel().makeNewUser()
      ;

      item.save(function(error){
        if (error) return alert(error.message);

        item.generateEmailFromId();

        item.save(function(error){
          if (error) return alert(error.message);

          this_.items.push(item.toJSON());

          this_.$itemsList[0].insertBefore(
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

          , this_.$itemsList[0].childNodes[0]
          );
        });
      });
    }

  , onItemsSearchKeyUp: function(e){
      this.fetchItem();
    }
  });
});