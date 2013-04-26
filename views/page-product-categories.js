define(function(require){
  var
    Page              = require('./page')
  , api               = require('../lib/api')
  , config            = require('../config')
  , utils             = require('../lib/utils')
  , troller           = require('../lib/troller')
  , Paginator         = require('../lib/paginator')
  , Components        = require('../lib/components')

  , template          = require('hbt!./../templates/page-product-categories')

  , Views = {
      Paginator       : require('./paginator')
    }
  ;

  return Page.extend({
    className: 'page page-menu-items'

  , name: 'Menu Items'

  , type: 'product-categories'

  , events: {
      // 'keyup #products-search':       'onProductsSearchKeyUp'
    }

  , initialize: function(options){
      var this_ = this;

      options = options || {};

      this.type           = 'product-categories';
      this.businessId     = options.businessId;
      this.business       = options.business;
      this.trollerPrefix  = options.trollerPrefix;

      this.template       = template;

      options.page        = options.page || 1;
      this.currentPage    = options.page - 1;

      this.paginator      = new Paginator({ page: this.currentPage, limit: 30 });

      // Initial set of products
      this.productCategories = [];

      this.dataParams = {};

      this.searchValue = null;

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      , listing: new Components.ProductCategoriesTable.Main({
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
        utils.history.navigate('/products/categories/page/' + (this_.currentPage + 1));

        this_.fetchProductCategories();
      });

      return this;
    }

  , onShow: function(options){
      this.business = options.business;
      this.businessId = options.businessId;
      this.currentPage = options.pageNum > 0 ? (options.pageNum - 1) : this.currentPage;
      this.paginator.setPage(this.currentPage);
      this.fetchProductCategories();
    }

  , fetchProductCategories: function(callback){
      troller.spinner.spin();

      var this_ = this;

      api.businesses.productCategories.list(this_.business.id, this_.getDataParams(), function(error, results){
        if (error) return callback ? callback(error) : troller.error(error);

        this_.productCategories = results;
        this_.children.listing.setItems(this_.productCategories);

        this_.render();

        this_.delegateEvents();

        troller.spinner.stop();

        if (callback) callback(null, results);
      });
    }


  , render: function(){
      this.$el.html(template({ count: this.paginator.total }));

      this.children.listing.setElement(
        this.$el.find('#product-categories-table')[0]
      );

      this.children.listing.render();

      if (this.paginator.maxPages <= 1) return this;

      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();

      this.$el.find('#product-categories-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('#product-categories-paginator-bottom').append(this.children.paginatorBottom.$el);

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
  });
});
