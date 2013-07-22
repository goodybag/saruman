define(function(require){
  var
    BasePage          = require('./base-page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , Components        = require('../../components/index')
  , troller           = require('../../lib/troller')

  , template          = require('hbt!./../../templates/accounts/users-page')

  , Views = {
      Paginator       : require('../paginator')
    , ItemView        : require('./user-list-item')
    }

  , Models = {
      ItemModel       : require('../../models/user-list-item')
    }
  ;

  return BasePage.extend({
    className: 'page page-users'

  , type: 'users'

  , initialize: function(options){
      this.template = template;

      options = options || {};

      this.template     = template;
      this.ItemModel    = Models.ItemModel;
      this.ItemView     = Views.ItemView;

      options.page      = options.page || 1;
      this.currentPage  = options.page - 1;

      this.paginator    = new Paginator({ page: this.currentPage, limit: 20 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      , userSearch:       new Components.UserSearch.Main()
      };

      this.listen();

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

  , fetchUsers: utils.throttle(function(resetPage){
      var
        this_   = this
      , paging  = this.paginator.getCurrent()
      , options = {
          limit : paging.limit
        , offset: paging.offset
        }
      ;
      if (resetPage) this.paginator.setPage(0);
      options[this.children.userSearch.$type.val()] = this.children.userSearch.$query.val();

      utils.parallel({
        users: function(done){
          api.users.search(options, function(error, users, meta){
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

          this_.users       = results.users;
          this_.groups      = results.groups;
          this_.groupsById  = {};

          for (var i = 0, l = results.groups.length; i < l; ++i){
            this_.groupsById[results.groups[i].id] = results.groups[i];
          }

          this_.renderUsers();
        }
      );

      return this;
    }, 666)

  , render: function() {
      this.$el.html(this.template());
      
      this.$el.find('.user-search-container').append(this.children.userSearch.$el);
      this.$usersList = this.$el.find('.users-list');
      this.$search = this.$el.find('.users-search');

      this.renderUsers();

      this.trigger('rendered');

      return this;
    }

  , listen: function() {
      this.listenTo(this.children.userSearch, 'submit', this.fetchUsers);
    }

  , getAdditionalViewOptions: function(){
      return {
        allGroups:    this.groups
      , groupsById:   this.groupsById
      };
    }
  });
});