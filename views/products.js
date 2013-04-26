define(function(require){
  var
    Page              = require('./page')
  , api               = require('../lib/api')
  , config            = require('../config')
  , utils             = require('../lib/utils')
  , troller           = require('../lib/troller')
  , Paginator         = require('../lib/paginator')
  , Components        = require('../lib/components')

  , template          = require('hbt!./../templates/page-products')

  , Views = {
      Paginator       : require('./paginator')
    }
  ;

  return Page.extend({
    className: 'page page-menu-items'

  , name: 'Menu Items'

  , type: 'products'

  , events: {
      'keyup #products-search':       'onProductsSearchKeyUp'
    }

  , initialize: function(options){
      var this_ = this;

      options = options || {};

      this.type           = 'products';
      this.businessId     = options.businessId;
      this.business       = options.business;
      this.trollerPrefix  = options.trollerPrefix;

      this.template       = template;

      options.page        = options.page || 1;
      this.currentPage    = options.page - 1;

      this.paginator      = new Paginator({ page: this.currentPage, limit: 30 });

      // Initial set of products
      this.products = [];

      this.dataParams = {
        include: ['categories', 'tags']
      };

      this.searchValue = null;

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      , listing: new Components.ProductsTable.Main({
          paginator: this.paginator
        , events: {
            onNewItemClick: function(e){
              e.preventDefault();
              this.addNewItem({
                businessId: this_.businessId
              }).enterEditMode();
            }
          }
        })
      };

      // When the paginator changes page
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('/products/' + this_.type + '/page/' + (this_.currentPage + 1));

        this_.fetchProducts();
      });

      return this;
    }

  , onShow: function(options){
      this.business = options.business;
      this.businessId = options.businessId;
      this.currentPage = options.pageNum > 0 ? (options.pageNum - 1) : this.currentPage;
      this.paginator.setPage(this.currentPage);
      this.fetchProducts();
    }

  , fetchProducts: function(){
      troller.spinner.spin();

      var this_ = this;

      utils.parallel({
        products: function(done){
          api.businesses.products.list(this_.business.id, this_.getDataParams(), function(error, results, meta){
            if (!error) this_.paginator.setTotal(meta.total);
            done(error, results);
          });

        }

      , categories: function(done){
          api.businesses.productCategories.list(this_.business.id, { limit: 1000 }, function(error, results){
            done(error, results);
          });
        }

      , tags: function(done){
          api.productTags.list({ businessId: this_.business.id, limit: 1000 }, function(error, results){
            done(error, results);
          });
        }
      }
      , function(error, results){
          if (error) return troller.app.error(error), troller.spinner.stop();

          this_.products    = results.products;
          this_.categories  = results.categories;

          // We want tags and categories to be indexable by name and id
          this_.tags = { _tags: [] };

          for (var i = 0, l = results.tags.length; i < l; ++i){
            this_.tags[results.tags[i].tag] = results.tags[i];
            this_.tags[results.tags[i].id] = results.tags[i];
            this_.tags._tags.push(results.tags[i].tag);
          }

          // We want tags and categories to be indexable by id
          this_.categories._categories = {};

          for (var i = 0, l = this_.categories.length; i < l; ++i){
            this_.categories._categories[this_.categories[i].id] = this_.categories[i];
          }

          this_.children.listing.setItems(this_.products);
          this_.children.listing.setCategories(this_.categories);
          this_.children.listing.setTags(this_.tags);

          this_.render();

          this_.delegateEvents();

          troller.spinner.stop();
        }
      );

    }


  , render: function(){
      this.$el.html(template({ count: this.paginator.total }));

      this.children.listing.setElement(
        this.$el.find('#products-table')[0]
      );

      this.children.listing.render();

      if (this.paginator.maxPages <= 1) return this;

      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();

      this.$el.find('#products-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('#products-paginator-bottom').append(this.children.paginatorBottom.$el);

      return this;
    }

  , getDataParams: function(){
      var params = utils.extend(
        this.dataParams
      , this.paginator.getCurrent()
      );

      if (this.searchValue) params.filter = this.searchValue;

      return params;
    }

  , onProductsSearchKeyUp: function(e){
      var this_ = this;

      if (this.searchTimeout) clearTimeout(this.searchTimeout);

      this.searchTimeout = setTimeout(function(){
        this_.searchValue = e.target.value;
        this_.fetchProducts();
      }, 400);
    }
  });
});
