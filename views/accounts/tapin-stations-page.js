define(function(require){
  var
    BasePage          = require('./base-page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')

  , template          = require('hbt!./../../templates/accounts/tapin-stations-page')

  , Views = {
      Paginator       : require('../paginator')
    , ItemView        : require('./tapin-stations-list-item')
    }

  , Models = {
      ItemModel       : require('../../models/tapin-station')
    }
  ;

  return BasePage.extend({
    className: 'page page-users'

  , type: 'tapin-stations'

  , initialize: function(options){
      this.template = template;

      options = options || {};

      this.businessId   = options.businessId;

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

      troller.add('tapinStations.setPage', function(page){
        this_.paginator.setPage(page - 1);
      });

      // We want to know when the page changes so we can update the url
      // And the collection
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('/accounts/tapin-stations/page/' + (this_.currentPage + 1));

        this_.fetchUsers();
      });
    }

  , getAdditionalViewOptions: function(){
      return {
        businesses:   this.businesses
      , businessIds:  this.businessIds
      };
    }

  , getAdditionalFetchUserParams: function(){
      return this.businessId ? { businessId: this.businessId } : {};
    }

  , onItemCopy: function(item){
      var this_ = this;

      item = item.clone();
      item.makeNewUser();

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