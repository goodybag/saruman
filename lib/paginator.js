define(function(require){
  var
    utils = require('./utils')
  ;

  var Paginator = function(options){
    this.options = {
      page:           0
    , limit:          30
    , total:          0
    , truncateLimit:  17
    }

    for (var key in options){
      this.options[key] = options[key];
    }

    this.page   = this.options.page;
    this.limit  = this.options.limit;

    this.current = {
      limit:    this.limit
    , offset:   this.page * this.limit
    };

    this.total = this.options.total;
    this.truncateLimit = this.options.truncateLimit;
    this.maxPages = Math.ceil(this.total / this.limit);

    return this;
  };

  Paginator.prototype.getCurrent = function(){
    return this.current;
  };

  Paginator.prototype.getPage = function(){
    return this.page;
  };

  Paginator.prototype.getNextPage = function(){
    if (this.page >= this.maxPages) return this.maxPages;
    return this.page + 1;
  };

  Paginator.prototype.getPreviousPage = function(){
    if (this.page <= 0) return 0;
    return this.page - 1;
  };

  Paginator.prototype.getMaxPages = function(){
    return this.maxPages;
  };

  Paginator.prototype.getTruncateLimit = function() {
    return this.truncateLimit;
  };

  Paginator.prototype.setTotal = function(total){
    if (this.total === total) return this;

    this.total = total;
    this.maxPages = Math.ceil(this.total / this.limit);
    this.trigger('change:total', this.getCurrent(), this.getMaxPages());

    return this;
  };

  Paginator.prototype.setPage = function(page){
    if (this.page === page) return this;

    // clamp
    if (page > this.maxPages) this.page = this.maxPages;
    else if (page < 0) this.page = 0;
    else this.page = page;

    this.current.offset = this.page * this.limit;
    this.trigger('change:page', this.getCurrent(), this.getMaxPages());

    return this;
  };

  Paginator.prototype.next = function(){
    if (this.page === this.maxPages) return this;

    this.current.offset = ++this.page * this.limit;
    this.trigger('change:page', this.getCurrent(), this.getMaxPages());

    return this.getCurrent();
  };

  Paginator.prototype.previous = function(){
    if (this.page === 0) return this;

    this.current.offset = --this.page * this.limit;
    this.trigger('change:page', this.getCurrent(), this.getMaxPages());

    return this.getCurrent();
  };

  utils.extend(Paginator.prototype, utils.Events);

  return Paginator;
});