define(function(require){
  var
    BasePage          = require('./base-page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
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
      };

      this.events['change .search-select'] = 'onSearchSelectChange';
      this.events['click .search-button']  = 'onUsersSearchKeyUp';

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

  , fetchUsers: function(){
      var
        this_   = this
      , paging  = this.paginator.getCurrent()
      , options = {
          limit : paging.limit
        , offset: paging.offset
        }
      , searchType  = this.$el.find('.search-wrapper .search-select').val()
      , searchQuery = this.$el.find('.users-search').val()
      ;

      options[searchType] = searchQuery;

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
    }

  , getAdditionalViewOptions: function(){
      return {
        allGroups:    this.groups
      , groupsById:   this.groupsById
      };
    }

  , onSearchSelectChange: function(e) {
      // Refreshes search with new search type
      e.preventDefault();
      this.paginator.setPage(0);
      this.fetchUsers();
    }
  });
});