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
        max           = this.paginator.getMaxPages()
      , page          = this.paginator.getPage()
      , prev          = this.paginator.getPreviousPage()
      , next          = this.paginator.getNextPage()
      , truncateLimit = this.paginator.getTruncateLimit()
      , pages         = this.buildPages(page, max, truncateLimit)
      ;

      this.$el.html(template({
        pages:            pages
      , current:          page + 1
      , first:            1
      , last:             max
      , previous:         prev + 1
      , next:             next + 1
      , cantGoBack:       page <= prev
      , cantGoForward:    next >= max
      }));

      this.delegateEvents();

      return this;
    }

  , buildPages: function(page, max, truncateLimit) {
      var pages = []
        , truncatePad = Math.floor(truncateLimit / 2); 

      if (max <= truncateLimit) {
        // Enumerate short list of pages
        for (var i = 0; i < max; i++){
          pages[i] = { index: i + 1, active: i === page };
        }        
      } else {
        // Truncate long lists
        if (page <= truncatePad) {
          // page is within first pad
          for (var i=0; i < truncateLimit; i++) {
            pages[i] = { index: i + 1, active: i === page};
          }
        } else if (page >= max - truncatePad) {
          // page is within last pad
          var offset = max-truncateLimit;
          for(var i= 0; i< truncateLimit; i++) {
            pages[i] = { index: i + offset + 1, active: i + offset === page};          
          }
        } else {
          // page is in the middle of the list
          var offset = page - truncatePad;
          for(var i= 0; i < truncateLimit; i++ ) {
            pages[i] = { index: i + offset + 1, active: i + offset === page};
          }
        }
      }

      return pages;
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