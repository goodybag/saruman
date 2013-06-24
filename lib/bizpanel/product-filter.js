define(function(require) {
  var _ = require('underscore');

  var UNCATEGORIZED = 'uncategorized';
  var SPOTLIGHT = 'spotlight';
  var ProductFilter = function(config) {
    config = config || {};
    this._search = '';
    this.searchString = '';
    this._categoryFilter = 'all';
    this._includeUncategorized = !config.hideUncategorized;
    this._includeSpotlight = !config.hideSpotlight;
  };

  _.extend(ProductFilter.prototype, {
    setSearchString: function(text) {
      this._search = text.toLowerCase();
      this.searchString = text;
    },
    //set the category filter
    //based on the raw value from the select
    setCategoryFilter: function(rawVal) {
      //can be either a categoryId or special keywords
      var num = parseInt(rawVal);
      this._categoryFilter = num ? num : rawVal;
    },
    _shouldFilter: function() {
      if(this._categoryFilter != '' && this._categoryFilter != 'all') return true;
    },
    //returns filtered list of products
    filterProducts: function(products) {
      var self = this;
      var shouldFilter = this._shouldFilter();
      var shouldSearch = this._search.length > 0;
      if(!shouldFilter && !shouldSearch) return products;
      return _.filter(products, function(product) {
        var category = product.categories[0];
        if(shouldSearch) {
          var toSearch = product.name + product.description;
          if(category) {
            toSearch += category.name;
          }
          toSearch = toSearch.toLowerCase();
          if(toSearch.indexOf(self._search) < 0) {
            return false;
          }
        }
        if(shouldFilter) {
          if(self._categoryFilter == SPOTLIGHT) {
            return product.inSpotlight;
          }
          else if(category) {
            return category.id == self._categoryFilter;
          }
          return self._categoryFilter == UNCATEGORIZED;
        }
        return true;
      });
    },
    //returns view object
    //to bind to category select dropdown
    //based on menu section
    getCategorySelectView: function(sections) {
      var self = this;
      var result = [];
      var all = {
        value: 'all',
        name: 'All',
        selected: false
      };
      var spotlightOption = {
        value: SPOTLIGHT,
        name: 'Spotlight',
        selected: true
      };
      var matched = false;
      if(this._includeSpotlight) {
        result.push(spotlightOption);
      } else {
        result.push(all);
      }
      _.each(sections, function(section) {
        var option = {
          value: section.id,
          name: section.name,
          selected: false
        };
        if(section.id == self._categoryFilter) {
          option.selected = matched = true;
        }
        result.push(option);
      });
      var uncategorized = {
        value: UNCATEGORIZED,
        name: 'Uncategorized'
      };
      if(this._includeUncategorized) {
        result.push(uncategorized);
      }
      //if no filter, match 'all'
      if(!matched) {
        if(this._categoryFilter == UNCATEGORIZED) {
          uncategorized.selected = true;
        } else {
          //a total non-match can happen if
          //the category filter is applied and then
          //a user deletes a category filter
          all.selected = true;
          //clear category filter
          this._categoryFilter = 'all';
        }
      }
      return result;
    }
  });

  return ProductFilter;
})
