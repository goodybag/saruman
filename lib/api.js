define(function(require){
  return {
    businesses:             require('./api/businesses')
  , session:                require('./api/session')
  , products:               require('./api/products')
  , productsCategories:     require('./api/product-categories')
  };
});