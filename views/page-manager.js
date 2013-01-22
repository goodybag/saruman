define(function(require){
  var
    Backbone = require('backbone')
  ;

  return Backbone.View.extend({
    className: 'pages'

  , initialize: function(options){
      // Non-instantiated views
      this.Pages = options.Pages;

      // Instantiated views
      this.pages = {};

      // Current page
      this.current = null;
    }

  , changePage: function(page, options){
      if (this.current === page) return this;

      if (!this.Pages[page]) return this;

      if (!this.pages[page]){
        this.pages[page] = new this.Pages[page](options);
        this.pages[page].hide();

        // Set initial display to none so we can switch them out
        this.pages[page].render();
        this.$el.append(this.pages[page].$el);
      }

      // Hide the current
      if (this.current) this.pages[this.current].hide();

      // Now show the new page
      this.pages[page].show();
      this.current = page;

      return this;
    }
  });
});