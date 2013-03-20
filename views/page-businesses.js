define(function(require){
  var
    Page              = require('./page')
  , pubsub            = require('../lib/pubsub')
  , api               = require('../lib/api')
  , utils             = require('../lib/utils')
  , config            = require('../config')
  , channels          = require('../lib/channels')
  , Paginator         = require('../lib/paginator')
  , troller           = require('../lib/troller')

  , template          = require('hbt!./../templates/page-businesses')
  , businessItemTmpl  = require('hbt!./../templates/business-list-item')

  , Views = {
      Paginator       : require('./paginator')
    }
  ;

  return Page.extend({
    className: 'page page-businesses'

  , events: {
      'click .btn-new-business':      'onNewBusinessClick'
    , 'keyup .business-search':       'onSearchKeyup'
    , 'click .is-goodybag-toggle':    'onIsGoodybagToggle'
    , 'click .filters button':        'onFilterClick'
    }

  , initialize: function(options){
      this.template = template;

      this.currentPage = options.page - 1;

      this.paginator = new Paginator({ page: options.page - 1, limit: 100 });

      this.filter = options.filter || {};

      this.children = {
        paginatorTop:     new Views.Paginator({ paginator: this.paginator })
      , paginatorBottom:  new Views.Paginator({ paginator: this.paginator })
      };

      var this_ = this;

      // We want to know when the page changes so we can update the url
      // And the collection
      this.paginator.on('change:page', function(){
        if (this_.currentPage === this_.paginator.getPage()) return;
        this_.currentPage = this_.paginator.getPage();
        utils.history.navigate('businesses/page/' + (this_.currentPage + 1));

        this_.fetchBusinesses();
      });
    }

  , setActiveNav: function(){
      var className = "all";

      if (this.filter && this.filter.isVerified === true) className = "verified";
      if (this.filter && this.filter.isVerified === false) className = "unverified";

      this.$el.find('#businesses-nav li').removeClass('active');
      this.$el.find('#businesses-nav .' + className).addClass('active');

      return this;
    }

  , onShow: function(options){
      if (options) this.filter = options.filter;

      if (options.page){
        this.paginator.setPage(options.page - 1);
        this.currentPage = this.paginator.getPage();

      }
      this.setActiveNav();

      this.fetchBusinesses();
    }

  , fetchBusinesses: function(){
      var this_ = this, options = utils.clone(this.paginator.getCurrent());

      options = utils.extend(options, this.filter);

      api.businesses.list(options, function(error, businesses, meta){
        if (error) return console.error(error);

        this_.paginator.setTotal(meta.total);
        this_.businesses = businesses;
        this_.renderBusinesses();
      });
    }

  , renderBusinesses: function(){
    console.log(this.businesses);
      var fragment = document.createDocumentFragment();
      fragment.innerHTML = "";
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

  , onFilterClick: function(e){
      var
        $btn    = utils.dom(e.target)
      , filter  = $btn.data('filter-name')
      , value   = $btn.data('filter-value');
      ;

      if ($btn.hasClass('active')){
        delete this.filter[filter];
        $btn.removeClass('active');
      } else {
        this.filter[filter] = value;
        $btn.addClass('active');
      }

      if (filter === 'isVerified'){
        this.$el.find('.filters .btn-' + (value ? 'un-' : '') + 'verified').removeClass('active');
      }

      this.fetchBusinesses();
    }

  , onIsGoodybagToggle: function(e){
      e.preventDefault();

      var $el = utils.dom(e.target), $update = {};

      $el[(($update.isGB = !$el.hasClass('active')) ? 'add' : 'remove') + 'Class']('active');

      api.businesses.update($el.data('id'), $update, function(error){
        if (error && error.message) return alert(error.message);
        if (error && !error.message) return alert('Something went wrong :(');
      });
    }

  , onNewBusinessClick: function(e){
      api.businesses.create(config.defaults.business, function(error, result){
        if (error) return alert(error.message);

        utils.history.navigate('/businesses/' + result.id, { trigger: true });
      });
    }

  , barrelRoll: function(){
      this.$el.addClass('barrel-roll');
      var this_ = this;
      setTimeout(function(){ this_.$el.removeClass('barrel-roll'); }, 5000); // Rate limit
    }

  , onSearchKeyup: function(e){
      if (e.target.value)
        this.filter.filter = e.target.value;
      else delete this.filter.filter;

      this.paginator.setPage(0);
      this.fetchBusinesses();

      if (e.target.value === "do a barrel roll") this.barrelRoll();
    }
  });
});