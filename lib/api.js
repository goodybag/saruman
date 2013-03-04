define(function(require){
  return {
    businesses:             require('./api/businesses')
  , locations:              require('./api/locations')
  , session:                require('./api/session')
  , products:               require('./api/products')
  , productsCategories:     require('./api/product-categories')
  , users:                  require('./api/users')
  , consumers:              require('./api/users').consumers
  , cashiers:               require('./api/users').cashiers
  , managers:               require('./api/users').managers
  , tapinStations:          require('./api/users').tapinStations
  , 'tapin-stations':       require('./api/users').tapinStations
  , groups:                 require('./api/groups')
  };
});