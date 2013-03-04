define(function(require){
  var
    Page              = require('../page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')

  , template          = require('hbt!./../../templates/accounts/consumers-page')

  , Views = {
      Paginator       : require('../paginator')
    }
  ;

  return Page.extend({
    className: 'page page-users'

  , events: {
      'keyup .users-search':            'onUsersSearchKeyUp'
    , 'click .users-search':            'onUsersSearchKeyUp'
    , 'click .btn-new-user':            'onNewUserBtnClick'
    }

  , initialize: function(options){
      this.template = template;

      options = options || {};

      // Pass in all of the views, model, and type or extend from this
      // and overide initialize
      this.type         = options.type;
      this.ItemModel    = options.ItemModel;
      this.ItemView     = options.ItemView;

      options.page      = options.page || 1;
      this.currentPage  = options.page - 1;

      this.paginator    = new Paginator({ page: this.currentPage, limit: 20 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      var this_ = this;

      troller.add('consumers.setPage', function(page){
        this_.paginator.setPage(page - 1);
      });

      // We want to know when the page changes so we can update the url
      // And the collection
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('/accounts/users/page/' + (this_.currentPage + 1));

        this_.fetchUsers();
      });
    }

  , onShow: function(){
      if (!this.hasShownOnce){
        this.fetchUsers();
        this.hasShownOnce = true;
      }
    }

  , fetchUsers: function(){
      var
        this_   = this
      , paging  = this.paginator.getCurrent()
      , options = utils.extend({
          limit : paging.limit
        , offset: paging.offset
        }, this.getAdditionalFetchUserParams())
      , filter  = this.$search.val()
      ;

      if (filter) options.filter = filter;

      api[this_.type].list(options, function(error, users, meta){
        if (error) return alert(error.message);

        this_.paginator.setTotal(meta.total);
        this_.users = users;

        this_.renderUsers();
      });

      return this;
    }

  , renderUsers: function(users, callback){
      if (typeof users === "function"){
        callback = users;
        users = [];
      } else users = users || this.users || [];

      var
        fragment  = document.createDocumentFragment()
      , this_     = this
      ;

      for (var i = 0, len = users.length, view; i < len; i++){
        fragment.appendChild(
          new this.ItemView(
            utils.extend({
              model: new this.ItemModel(users[i])
            }, this.getAdditionalViewOptions())
          ).render()
          .on('destroy', function(item){ this_.onItemDestroy(item) })
          .on('copy', function(item){ this_.onItemCopy(item) })
          .$el[0]
        );
      }
      this.$usersList.html(fragment);

      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();

      // Insert paginators
      if (this.paginator.maxPages <= 1){
        if (callback) callback();
        return this;
      }

      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();
      this.$el.find('.users-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('.users-paginator-bottom').append(this.children.paginatorBottom.$el);

      if (callback) callback();

      return this;
    }

  , render: function(){
      this.$el.html(this.template());

      this.$usersList = this.$el.find('.users-list');
      this.$search = this.$el.find('.users-search');

      this.renderUsers();

      return this;
    }

  , getAdditionalViewOptions: function(){ return {}; }
  , getAdditionalFetchUserParams: function(){ return {}; }

  , onItemCopy: function(item){
      var this_ = this;

      item = item.clone();
      item.set('id', 'New');
      item.set('password', 'password');

      return this_.$usersList[0].insertBefore(
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

      , this_.$usersList[0].childNodes[0]
      );
    }

  , onItemDestroy: function(item){
      if (!item || item.id === "New") return;
      this.users = utils.removeFromArray(this.users, item, 'id', true);
      this.renderUsers();
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

          this_.users.push(item.toJSON());

          this_.$usersList[0].insertBefore(
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

          , this_.$usersList[0].childNodes[0]
          );
        });
      });
    }

  , onUsersSearchKeyUp: function(e){
      var
        this_ = this
      , paging = this.paginator.getCurrent()
      , options = {
          filter: this.$search.val()
        , limit:  paging.limit
        , offset: paging.offset
        }
      ;

      troller.consumers.setPage(1);

      api[this.type].list(options, function(error, users, meta){
        if (error) return alert(error);

        this_.users = users;
        this_.paginator.setTotal(meta.total);
        this_.renderUsers();
      });
    }
  });
});