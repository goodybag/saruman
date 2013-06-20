define(function(require) {
  var utils = require('../../../lib/utils');
  var MsgView = require('./msg-view');
  var template = require('hbt!../../../templates/bizpanel/menu-section-editor');
  return MsgView.extend({
    template: template,
    events: {
      "blur input": "updateProduct",
      "blur textarea": "updateProduct"
    },
    render: function(data) {
      this.$el.html(this.template(data));
    },
    sortAndRender: function() {
      this.sections = _.sortBy(this.sections, function(section) {
        return section.order
      });
      this.sections[0].order = 0;
      for(var i = 0; i < this.sections.length; i++) {
        var newSection = this.sections[i];
        //ensure sections are ordered sanely
        if(i > 0) {
          if(this.sections[i-1].order != newSection.order-1) {
            newSection.order = this.sections[i-1].order + 1;
          }
        }
      }
      this.render({sections: this.sections})
    },
    updateProduct: function(e) {
      var $el = $(e.target);
      var $row = $el.closest('.menu-section');
      var sectionId = $row.data('id');
      var section = this.getSection(sectionId);
      section.name = $row.find('.section-name').val();
      section.description = $row.find('.section-description').val();
      console.log(section.name, section.description);
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
    //get a single section by id
    getSection: function(id) {
      for(var i = 0; i < this.sections.length; i++) {
        var section = this.sections[i];
        if(section.id == id) return section;
      }
      throw new Error('Can not find section with id ' + id);
    },
    //sets old sections & new sections as a clone 
    //so the edits can be saved or canceled in a batch
    setSections: function(sections) {
      this.oldSections = sections;
      var clones = [];
      for(var i = 0; i < sections.length; i++) {
        var newSection = _.clone(sections[i]);
        clones.push(newSection);
      }
      this.sections = clones;
    },
    subscribe: {
      loadMenuEnd: function(data) {
        //make a clone of the menu sections so they can be modified
        //without changing the original menu item references
        //ensure each section is uniquely ordered
        this.setSections(data.sections);
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
      saveMenuSectionEdits: function() {
        //publish a message off to the loader to
        //enact these changes against magic
        this.publish('saveSectionChangesBegin', {
          oldSections: this.oldSections,
          newSections: this.sections
        });
      },
      //if the edits are canceled, reset the state
      //to the original
      cancelMenuSectionEdits: function() {
        this.setSections(this.oldSections);
        this.render({sections: this.sections});
      },
      deleteSection: function(msg) {
        this.sections = _.filter(this.sections, function(section) {
          console.log(section.id, msg.id);
          return section.id != msg.id
        });
        this.sortAndRender();
      }
    }
  });
});