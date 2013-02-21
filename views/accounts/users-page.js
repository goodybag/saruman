define(function(require){
  var
    Page              = require('../page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')

  , template          = require('hbt!./../../templates/accounts/users-page')

  , Views = {
      Paginator       : require('../paginator')
    , UserItem        : require('./user-list-item')
    }
  ;

  return Page.extend({
    className: 'page page-users'

  , name: 'Users'

  , initialize: function(options){
      this.template = template;

      options = options || {};

      options.page = options.page || 1;

      this.currentPage = options.page - 1;

      this.paginator = new Paginator({ page: this.currentPage, limit: 10 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      var this_ = this;

      troller.add('users.setPage', function(page){
        console.log("setting to page", page);
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
      var this_ = this;

      utils.parallel({
        users: function(done){
          api.users.list(this_.paginator.getCurrent(), function(error, users, meta){
            if (error) return done(error);

            this_.paginator.setTotal(meta.total);

            return done(null, users);
          });
        }

      , groups: function(done){
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

      var fragment = document.createDocumentFragment();
      for (var i = 0, len = users.length, view; i < len; i++){
        fragment.appendChild(
          new Views.UserItem({
            model:      users[i]
          , allGroups:  this.groups
          }).render().$el[0]
        );
      }

      this.$el.find('#users-list').html(fragment);

      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();

      if (callback) callback();

      return this;
    }

  , render: function(){
      this.$el.html(template());

      this.renderUsers();
console.log(this.paginator.maxPages, this.users);
      // Insert paginators
      if (this.paginator.maxPages <= 1) return this;
      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();
      console.log(this.$el.find('#users-paginator-top'))
      this.$el.find('#users-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('#users-paginator-bottom').append(this.children.paginatorBottom.$el);


      return this;
    }
  });
});