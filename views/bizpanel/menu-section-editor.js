define(function(require) {
  var utils = require('../../../lib/utils');
  var MsgView = require('./msg-view');
  var template = require('hbt!../../../templates/bizpanel/menu-section-editor');
  return MsgView.extend({
    template: template,
    render: function(data) {
      this.$el.html(this.template(data));
    },
    sortAndRender: function() {
      this.sections = _.sortBy(this.sections, function(section) {
        return section.order
      });
      this.render({sections: this.sections})
    },
    swapSections: function(section, other) { 
      var otherOrder = other.order;
      if(otherOrder == section.order) {
        otherOrder++;
      }
      other.order = section.order;
      section.order = otherOrder;
    },
    //returns internal cloned sections
    //for saving
    getSections: function() {
      return this.sections;
    },
    subscribe: {
      loadMenuEnd: function(data) {
        //make a clone of the menu sections so they can be modified
        //without changing the original menu item references
        this.oldSections = data.sections;
        this.sections = _.map(data.sections, _.clone);
        this.sortAndRender();
      },
      moveSectionUp: function(msg) {
        for(var i = 1; i < this.sections.length; i++) {
          var section = this.sections[i];
          if(section.id == msg.id) {
            this.swapSections(section, this.sections[i-1]);
            break;
          }
        }
        this.sortAndRender();
      },
      moveSectionDown: function(msg) {
        for(var i = 0; i < this.sections.length-1; i++) {
          var section = this.sections[i];
          if(section.id == msg.id) {
            this.swapSections(section, this.sections[i+1]);
            break;
          }
        }
        this.sortAndRender();
      },
      addSection: function() {
        var name = "New Section " + this.sections.length;
        var order = this.sections[this.sections.length-1].order + 1;
        this.sections.push({
          id: '<UNSAVED>' + this.oldSections.length,
          order: order,
          name: name,
          description: 'Description for "' + name + '"'
        });
        this.sortAndRender();
      },
      saveSections: function() {
        //publish a message off to the loader to
        //enact these changes against magic
        this.publish('saveSectionChangesBegin', {
          oldSections: this.oldSections,
          newSections: this.sections
        });
      }
    }
  });
});
