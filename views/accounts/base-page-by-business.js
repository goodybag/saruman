define(function(require){
  var
    BasePage          = require('./base-page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')
  , Views = {
      Paginator       : require('../paginator')
    }
  ;

  return BasePage.extend({
    className: 'page page-users'

  , initialize: function(options){
      options = options || {};

      this.type       = options.type;
      this.businessId = options.businessId;
      this.business   = options.business;
      this.template   = options.template;
      this.ItemModel  = options.ItemModel;
      this.ItemView   = options.ItemView;

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      var this_ = this;

      troller.add(this.type + '.setPage', function(page){
        this_.paginator.setPage(page - 1);
      });

      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('/accounts/' + this_.type + '/page/' + (this_.currentPage + 1));

        this_.fetchUsers();
      });

      return this;
    }

  , onShow: function(){
      this.fetchUsers();
    }

  , fetchUsers: function(){
      var
        this_   = this
      , paging  = this.paginator.getCurrent()
      , options = utils.extend({
          limit :     paging.limit
        , offset:     paging.offset
        , businessId: this.businessId
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
      , business: function(done){
          if (this_.business && this_.business.id === this_.businessId)
            return done(null, this_.business);

          api.businesses.get(this_.businessId, function(error, business){
            return done(error, business);
          });
        }
      , locations: function(done){
          if (this_.business && this_.business.id === this_.businessId && this_.business.locations)
            return done(null, this_.business.locations);

          api.businesses.locations.list(this_.businessId, function(error, locations){
            return done(error, locations);
          })
        }
      }, function(error, results){
          if (error) return alert(error);

          this_.users               = results.users;
          this_.business            = results.business;
          this_.business.locations  = results.locations;

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

      var
        fragment  = document.createDocumentFragment()
      , this_     = this
      ;

      for (var i = 0, len = users.length, view; i < len; i++){
        fragment.appendChild(
          new this.ItemView(
            utils.extend({
              model:    new this.ItemModel(users[i])
            , business: this.business
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

  , onItemCopy: function(item){
      var this_ = this;

      item = item.clone();
      item.makeNewUser();
      item.set('businessId', this.businessId);

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

  , onNewUserBtnClick: function(e){
      var
        this_ = this
      , item  = new this.ItemModel().makeNewUser()
      ;

      item.set('businessId', this.businessId);

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
              , business: this_.business
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
  });
});