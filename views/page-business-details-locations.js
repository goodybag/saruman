define(function(require){
  var
    Page              = require('./page')
  , pubsub            = require('../lib/pubsub')
  , api               = require('../lib/api')
  , config            = require('../config')
  , utils             = require('../lib/utils')
  , channels          = require('../lib/channels')
  , Paginator         = require('../lib/paginator')

  , template          = require('hbt!./../templates/page-business-details-locations')

  , Views = {
      Paginator       : require('./paginator')
    , Location        : require('./page-business-details-location')
    }
  ;

  return Page.extend({
    className: 'page page-business-details-locations'

  , events: {
      'click .add-location': 'onAddLocationClick'
    }

  , initialize: function(options){
      var this_ = this;

      this.business = options.business;
      this.currentPage = options.pageNum > 0 ? (options.pageNum - 1) : 0;

      // Initial set of locations
      this.locations = [];

      this.paginator = new Paginator({ page: this.currentPage, limit: 10 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      // Fetch locations when this view is requested
      pubsub.subscribe(channels.business.changePage.locations, function(channel, data){
        this_.currentPage = data.pageNum > 0 ? (data.pageNum - 1) : this_.currentPage;
        this_.paginator.setPage(this_.currentPage);
        this_.fetchLocations();
      });

      // When the paginator changes page
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        var curr = window.location.hash.substring(1);
        curr = curr.substring(0, curr.lastIndexOf('/') + 1);
        utils.history.navigate(curr + parseInt((this_.currentPage) + 1));

        this_.fetchLocations();
      });

      // When the paginator changes total
      this.paginator.on('change:total', function(){
        this_.$el.find('.count').html(this_.paginator.total);
      });

      // Fetch locations when this view is instantiated
      pubsub.publish(channels.business.changePage.locations, {
        page: this.currentPage
      });
    }

  , fetchLocations: function(){
      var this_ = this;
      api.businesses.locations.list(this.business.id, this.paginator.getCurrent(), function(error, locations, meta){
        if (error) return console.error(error);

        this_.paginator.setTotal(meta.total);
        this_.locations = locations;
        this_.render();
        this_.delegateEvents();
      });
    }

  , renderLocations: function(){
      if (!this.locations || this.locations.length === 0) return this;

      var $list = this.$el.find('#locations-list');
      $list.html("");
      for (var i = 0, len = this.locations.length, view; i < len; i++){
        view = new Views.Location({
          location: this.locations[i]
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

      this.renderLocations();

      if (this.paginator.maxPages <= 1) return this;
      this.children.paginatorTop.render();
      this.children.paginatorBottom.render();
      this.$el.find('#locations-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('#locations-paginator-bottom').append(this.children.paginatorBottom.$el);

      return this;
    }

  , onAddLocationClick: function(e){
      var location = utils.clone(config.defaults.location), this_ = this;
      location.businessId = this.business.id;
      api.locations.create(location, function(error, result){
        if (error) return alert(error);

        pubsub.publish(channels.app.changePage.business, { id: this_.business.id, page: 'location' });
        pubsub.publish(channels.business.changePage.location, { locationId: result.id, location: location, isNew: true });
        utils.history.navigate('businesses/' + this_.business.id + '/locations/' + result.id);
      });
    }
  });
});