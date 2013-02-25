define(function(require){
  var
    Page              = require('../page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')

  , Views = {
      Paginator       : require('../paginator')
    , UserItem        : require('./user-list-item')
    }
  ;

  return Page.extend({
    className: 'page page-users'

  , events: {
      'keyup .users-search':            'onUsersSearchKeyUp'
    , 'click .users-new-user-btn':      'onNewUserBtnClick'
    }

  , initialize: function(options){

      options = options || {};
      options.page = options.page || 1;


      this.currentPage = options.page - 1;

      this.paginator = new Paginator({ page: this.currentPage, limit: 20 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      var this_ = this;

      troller.add('users.setPage', function(page){
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
      this.fetchUsers();
    }

  , fetchUsers: function(){
      var
        this_   = this
      , paging  = this.paginator.getCurrent()
      , options = {
          limit : paging.limit
        , offset: paging.offset
        }
      , filter  = this.$search.val()
      ;

      if (filter) options.filter = filter;

      utils.parallel({
        users: function(done){
          api.users.list(options, function(error, users, meta){
            if (error) return done(error);

            this_.paginator.setTotal(meta.total);

            return done(null, users);
          });
        }

      , groups: function(done){
          if (this_.groups) return done(null, this_.groups);

          api.groups.list(function(error, groups){
            if (error) return done(error);
            return done(null, groups);
          });
        }
      }, function(error, results){
          if (error) return alert(error);

          this_.users = results.users;
          this_.groups = results.groups;

          this_.renderUsers();
        }
      );

      return this;
    }

  , renderUsers: function(users, callback){
      if (typeof users === "function"){
        callback = users;
        users = [];
      } else users = users || this.users || [];

      var fragment = document.createDocumentFragment(), this_ = this;
      for (var i = 0, len = users.length, view; i < len; i++){
        fragment.appendChild(
          new Views.UserItem({
            model:      users[i]
          , allGroups:  this.groups
          }).render()
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

  , onItemCopy: function(item){
      var this_ = this;

      item = utils.clone(item);
      item.id = 'New';

      this.$usersList[0].insertBefore(
        new Views.UserItem({
          model:      item
        , allGroups:  this.groups
        , isNew:      true
        }).render()
          .enterEditMode()
          .on('destroy', function(item){ this_.onItemDestroy(item) })
          .on('copy', function(item){ this_.onItemCopy(item) })
          .$el[0]

      , this.$usersList[0].childNodes[0]
      );
    }

  , onItemDestroy: function(item){
      if (!item || item.id === "New") return;
      this.users = utils.removeFromArray(this.users, item, 'id', true);
      this.renderUsers();
    }

  , onNewUserBtnClick: function(e){
      var this_ = this;

      this.$usersList[0].insertBefore(
        new Views.UserItem({
          model:      {}
        , allGroups:  this.groups
        , isNew:      true
        }).render()
          .enterEditMode()
          .on('destroy', function(item){ this_.onItemDestroy(item) })
          .on('copy', function(item){ this_.onItemCopy(item) })
          .$el[0]

      , this.$usersList[0].childNodes[0]
      );
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

      troller.users.setPage(1);

      api.users.list(options, function(error, users, meta){
        if (error) return alert(error);

        this_.users = users;
        this_.paginator.setTotal(meta.total);
        this_.renderUsers();
      });
    }
  });
});