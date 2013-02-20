define(function(require){
  var
    Page              = require('./page')
  , pubsub            = require('../lib/pubsub')
  , api               = require('../lib/api')
  , utils             = require('../lib/utils')
  , channels          = require('../lib/channels')
  , Paginator         = require('../lib/paginator')
  , troller           = require('../lib/troller')

  , template          = require('hbt!./../templates/page-businesses')
  , businessItemTmpl  = require('hbt!./../templates/business-list-item')

  , Views = {
      Paginator       : require('../paginator')
      UserItem        : require('./user-list-item')
    }
  ;

  return Page.extend({
    className: 'page page-businesses'

  , name: 'Users'

  , initialize: function(options){
      this.template = template;

      this.currentPage = options.page - 1;

      this.paginator = new Paginator({ page: options.page - 1, limit: 100 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      var this_ = this;

      troller.add('users.setPage', function(page){
        this_.paginator.setPage(page - 1);
      });

      // We want to know when the page changes so we can update the url
      // And the collection
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('/accounts/users/page/' + (this_.currentPage + 1));

        this_.fetchUsers();
      });
    }

  , onShow: function(){
      this.fetchUsers();
    }

  , fetchUsers: function(){
      var this_ = this;
      api.users.list(this.paginator.getCurrent(), function(error, businesses, meta){
        if (error) return console.error(error);

        this_.paginator.setTotal(meta.total);
        this_.businesses = businesses;
        this_.renderBusinesses();
      });
    }

  , renderBusinesses: function(){
      var fragment = document.createDocumentFragment();
      for (var i = 0, len = this.users.length, view; i < len; i++){
        fragment.append( new Views.UserItem(this.users[i]).render().$el[0] );
      }

      this.$el.find('.users-list').html(fragment);

      return this;
    }

  , render: function(){
      this.$el.html(template());

      // Insert paginators
      console.log(this.paginator);

      if (this.paginator.maxPages <= 1) return this;
      this.children.paginatorTop.render()
      this.children.paginatorBottom.render()
      this.$el.find('#business-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('#business-paginator-bottom').append(this.children.paginatorBottom.$el);

      return this;
    }
  });
});