define(function(require){
  return {
    businesses:             require('./api/businesses')
  , auth:                   require('./api/auth')
  , products:               require('./api/products')
  , productsCategories:     require('./api/productsCategories')
  };
});