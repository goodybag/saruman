define(function(require){
  var
    utils = require('../lib/utils')

  , template = require('hbt!../templates/paginator')
  ;

  return utils.View.extend({
    className: 'pagination pagination-centered'

  , events: {
      'click a': 'onPaginationClick'
    }

  , initialize: function(options){
      this.paginator = options.paginator;
      this.baseUrl = options.baseUrl

      this.paginator.on('change:page', this.render, this);
      this.paginator.on('change:total', this.render, this);
    }

  , render: function(){
      var
        max     = this.paginator.getMaxPages()
      , page    = this.paginator.getPage()
      , prev    = this.paginator.getPreviousPage()
      , next    = this.paginator.getNextPage()
      , pages   = []
      ;

      // Build the pages list
      for (var i = 0; i < max; i++){
        pages[i] = { index: i + 1, active: i === page };
      }

      this.$el.html(template({
        pages:            pages
      , previous:         prev + 1
      , next:             next + 1
      , cantGoBack:       page === prev
      , cantGoForward:    page === next
      }));

      this.delegateEvents();

      return this;
    }

  , onPaginationClick: function(e){
      e.preventDefault();

      var $anchor = $(e.target);
      if ($anchor.parent('li').hasClass('disabled') || $anchor.hasClass('active')) return false;

      var page = parseInt($anchor.attr('href')) - 1;

      this.paginator.setPage(page);
      return false;
    }
  });
});