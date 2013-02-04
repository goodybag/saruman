define(function(require){
  var
    Page              = require('./page')
  , pubsub            = require('../lib/pubsub')
  , api               = require('../lib/api')
  , utils             = require('../lib/utils')
  , channels          = require('../lib/channels')
  , Paginator         = require('../lib/paginator')

  , template          = require('hbt!./../templates/page-businesses')
  , businessItemTmpl  = require('hbt!./../templates/business-list-item')

  , Views = {
      Paginator       : require('./paginator')
    }
  ;

  return Page.extend({
    className: 'page page-businesses'

  , initialize: function(options){
      this.template = template;

      this.currentPage = options.page - 1;

      this.paginator = new Paginator({ page: options.page - 1, limit: 100 });

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      var this_ = this;

      // Whenever we change to businesses, fetch a new list
      pubsub.subscribe(channels.app.changePage.businesses, function(){
        this_.fetchBusinesses();
      });

      pubsub.subscribe(channels.businesses.pagination, function(channel, page){
        this_.paginator.setPage(page - 1);
      });

      // We want to know when the page changes so we can update the url
      // And the collection
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('businesses/page/' + (this_.currentPage + 1));

        this_.fetchBusinesses();
      });

      // Change-page subscription made after the message was published
      // So fetch on init as well
      this_.fetchBusinesses();
    }

  , fetchBusinesses: function(){
      var this_ = this;
      api.businesses.list(this.paginator.getCurrent(), function(error, businesses, meta){
        if (error) return console.error(error);

        this_.paginator.setTotal(meta.total);
        this_.businesses = businesses;
        this_.renderBusinesses();
      });
    }

  , renderBusinesses: function(){
      var fragment = document.createDocumentFragment();
      for (var i = 0, len = this.businesses.length; i < len; i++){
        var html = businessItemTmpl(this.businesses[i]);
        fragment.innerHTML += html;
      }

      this.$el.find('#businesses-list').html(fragment.innerHTML);
     $('.is-verified', this.$el.find('#businesses-list')).click(function(){
        if ($(this).hasClass('icon-check')) {
          api.businesses.update(+$(this).attr('data-id'), {isVerified: false}, function(){});
          $(this).removeClass('icon-check').addClass('icon-check-empty');
          $(this).css('color', 'red');
        } else if ($(this).hasClass('icon-check-empty')) {
          api.businesses.update(+$(this).attr('data-id'), {isVerified: true}, function(){});
          $(this).removeClass('icon-check-empty').addClass('icon-check');
          $(this).css('color', 'green');
        }

        return false;
      });
     $('.is-flagged', this.$el.find('#businesses-list')).click(function(){
      var $this = $(this);
      bootbox.prompt("Enter in any notes<br/><h5>Current Notes:</h5><h6 style='color:grey;'>"+$this.attr('title')+"</h6>", "cancel", "confirm", function(result) {
        if (result === null) return;
        if (result === "") {
          api.businesses.update(+$this.attr('data-id'), {comment: null, isflagged: false}, function(){});
          $this.attr('title', "");
          $this.css('color', 'grey');
        } else {
          api.businesses.update(+$this.attr('data-id'), {comment: result, isflagged: true}, function(){});
          $this.attr('title', result);
          $this.css('color', 'blue');
        }
      }, $this.attr('title'));
      return false;
     });

      if (this.paginator.maxPages <= 1) return this;
      this.children.paginatorTop.render()
      this.children.paginatorBottom.render()
      this.$el.find('#business-paginator-top').append(this.children.paginatorTop.$el);
      this.$el.find('#business-paginator-bottom').append(this.children.paginatorBottom.$el);

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