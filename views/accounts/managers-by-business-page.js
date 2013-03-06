define(function(require){
  var
    BasePage          = require('./base-page-by-business')
  , api               = require('../../lib/api')
  , utils             = require('../../lib/utils')
  , Paginator         = require('../../lib/paginator')
  , troller           = require('../../lib/troller')

  , template          = require('hbt!./../../templates/accounts/managers-by-business-page')

  , Views = {
      Paginator       : require('../paginator')
    , ItemView        : require('./managers-by-business-list-item')
    }

  , Models = {
      ItemModel       : require('../../models/manager')
    }
  ;

  return BasePage.extend({
    className: 'page page-users'

  , type: 'managers'

  , initialize: function(options){
      options = options || {};

      this.type           = 'managers';
      this.businessId     = options.businessId;
      this.business       = options.business;
      this.trollerPrefix  = options.trollerPrefix;

      this.template   = template;
      this.ItemModel  = Models.ItemModel;
      this.ItemView   = Views.ItemView;

      options.page      = options.page || 1;
      this.currentPage  = options.page - 1;

      this.paginator    = new Paginator({ page: this.currentPage, limit: 30 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      var this_ = this;

      troller.add(this.trollerPrefix + '.' + this.type + '.setPage', function(page){
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
  });
});