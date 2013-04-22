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
    , Location        : require('./page-business-details-location')
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
      , listing:          new Components.ProductsTable.Main({ paginator: this.paginator })
      };

      // When the paginator changes page
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('/accounts/' + this_.type + '/page/' + (this_.currentPage + 1));

        this_.fetchProductCategories();
      });

      return this;
    }

  , onShow: function(options){
      this.currentPage = options.pageNum > 0 ? (options.pageNum - 1) : this.currentPage;
      this.paginator.setPage(this.currentPage);
      this.fetchProductCategories();
    }

  , fetchProductCategories: function(){
      troller.spinner.spin();

      var this_ = this;

      api.businesses.productCategories.list(this_.business.id, this_.getDataParams(), function(error, results){
        done(error, results);
      });
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
        this_.fetchProductCategories();
      }, 400);
    }

  , onAddProductClick: function(e){
      var product = utils.clone(config.defaults.product), this_ = this;
      product.businessId = this.business.id;
      api.products.create(product, function(error, result){
        if (error) return alert(error);

        product.id = result.id;

        troller.business.changePage('product', { productId: result.id, product: product, isNew: true });
        utils.history.navigate('/businesses/' + this_.business.id + '/products/create');
      });
    }
  });
});