define(function(require){
  var
    Page              = require('./page')
  , api               = require('../lib/api')
  , config            = require('../config')
  , utils             = require('../lib/utils')
  , troller           = require('../lib/troller')
  , Paginator         = require('../lib/paginator')

  , template          = require('hbt!./../templates/page-menu-items')

  , Views = {
      Paginator       : require('./paginator')
    , Location        : require('./page-business-details-location')
    }
  ;

  return Page.extend({
    className: 'page page-menu-items'

  , name: 'Menu Items'

  , events: { }

  , initialize: function(options){
      var this_ = this;

      this.business = options.business;
      this.currentPage = options.pageNum > 0 ? (options.pageNum - 1) : 0;

      // Initial set of products
      this.products = [];

      this.paginator = new Paginator({ page: this.currentPage, limit: 10 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      // When the paginator changes page
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        var curr = window.location.hash.substring(1);
        curr = curr.substring(0, curr.lastIndexOf('/') + 1);
        utils.history.navigate(curr + parseInt((this_.currentPage) + 1));

        this_.fetchProducts();
      });

      // When the paginator changes total
      this.paginator.on('change:total', function(){
        this_.$el.find('.count').html(this_.paginator.total);
      });
    }

  , onShow: function(options){
      this.currentPage = options.pageNum > 0 ? (options.pageNum - 1) : this.currentPage;
      this.paginator.setPage(this.currentPage);
      this.fetchProducts();
    }

  , fetchProducts: function(){
      var this_ = this;
      api.businesses.products.list(this.business.id, this.paginator.getCurrent(), function(error, products, meta){
        if (error) return troller.app.error(error);

        this_.paginator.setTotal(meta.total);
        this_.products = products;
        this_.render();
        this_.delegateEvents();
      });
    }

  , renderProducts: function(){
      if (!this.products || this.products.length === 0) return this;

      var $list = this.$el.find('#products-list');
      $list.html("");
      for (var i = 0, len = this.products.length, view; i < len; i++){
        view = new Views.Product({
          product: this.products[i]
        , parent: this
        }).render();

        $list.append(view.$el);

        this.delegateEvents();
        view.delegateEvents();
      }

      return this;
    }


  , render: function(){
      this.$el.html(template({ count: this.paginator.total }));

      this.renderProducts();

      if (this.paginator.maxPages <= 1) return this;
      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();
      this.$el.find('#products-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('#products-paginator-bottom').append(this.children.paginatorBottom.$el);

      return this;
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