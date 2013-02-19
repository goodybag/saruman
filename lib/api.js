define(function(require){
  return {
    businesses:             require('./api/businesses')
  , locations:              require('./api/locations')
  , session:                require('./api/session')
  , products:               require('./api/products')
  , productsCategories:     require('./api/product-categories')
  , users:                  require('./api/users')
  };
});