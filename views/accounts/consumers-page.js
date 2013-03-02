define(function(require){
  var
    BasePage          = require('./base-page')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')

  , template          = require('hbt!./../../templates/accounts/consumers-page')

  , Views = {
      Paginator       : require('../paginator')
    , ItemView        : require('./consumers-list-item')
    }

  , Models = {
      ItemModel       : require('../../models/consumer')
    }
  ;

  return BasePage.extend({
    className: 'page page-users'

  , type: 'consumers'

  , initialize: function(options){
      this.template = template;

      options = options || {};

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

      troller.add('consumers.setPage', function(page){
        this_.paginator.setPage(page - 1);
      });

      // We want to know when the page changes so we can update the url
      // And the collection
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('/accounts/consumers/page/' + (this_.currentPage + 1));

        this_.fetchUsers();
      });
    }
  });
});