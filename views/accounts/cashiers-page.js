define(function(require){
  var
    BasePage          = require('./base-page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')

  , template          = require('hbt!./../../templates/accounts/consumers-page')

  , Views = {
      Paginator       : require('../paginator')
    , ItemView        : require('./cashiers-list-item')
    }

  , Models = {
      ItemModel       : require('../../models/consumer')
    }
  ;

  return BasePage.extend({
    className: 'page page-users'

  , type: 'cashiers'

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

      var this_ = this;

      troller.add('cashiers.setPage', function(page){
        this_.paginator.setPage(page - 1);
      });

      // We want to know when the page changes so we can update the url
      // And the collection
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('/accounts/cashiers/page/' + (this_.currentPage + 1));

        this_.fetchUsers();
      });
    }

  , getAdditionalViewOptions: function(){
      return {
        businesses:   this.businesses
      , businessIds:  this.businessIds
      };
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
          api[this_.type].list(options, function(error, users, meta){
            if (error) return done(error);

            this_.paginator.setTotal(meta.total);

            return done(null, users);
          });
        }
      , businesses: function(done){
          var options = { limit: 10000, offset: 0, include: 'locations' };
          api.businesses.list(options, function(error, businesses, meta){
            if (error) return done(error);

            return done(null, businesses);
          });
        }
      }, function(error, results){
          if (error) return alert(error);

          this_.users = results.users;
          this_.businesses = results.businesses;

          // Cache businesses by id
          this_.businessIds = {};

          for (var i = 0, l = this_.businesses.length; i < l; ++i){
            this_.businessIds[this_.businesses[i].id] = this_.businesses[i];
          }

          this_.renderUsers();
        }
      );

      return this;
    }
  });
});