/*global require:true, module:true, define:true */

/*
============================================================
STARTER PACK COMPONENTS
============================================================
Components are the building blocks of rich UIs. Their purpose
in life is to augment an existing HTML element on the page
and make it produce new events, accept additional
configuration, and add/remove classes as required. By
default, Components do not depend on anything other than Atomic
itself. Often times, developers will use a DOM Library such
as YUI or jQuery to make the DOM operations easier.

The Carousel Component provides an API for manipulating a
"current" class on a collection of nodes, defined as the
Items in nodes:{}.
*/
var Atomic = require('atomic');

function factory() {
  var $ = require('jquery');

  var CURRENT_CLASS = 'current';

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack Carousel by @jakobo',

    // no dependencies
    needs: {},

    // no additional nodes needed
    nodes: {
      Items: null
    },

    // events
    events: {
      END: 'end',
      FIRST: 'first'
    },

    // wiring functions to make this work
    wiring: function(needs, nodes) {
      this.index = 0;
      this.$items = $(nodes.Items);
      this.go(this.index);
    },

    go: function(to) {
      if (to < 0 || to > this.$items.length - 1) {
        return this;
      }
      this.index = to;
      this.$items.removeClass(CURRENT_CLASS);
      this.$items.eq(this.index).addClass(CURRENT_CLASS);
      return this;
    },

    first: function() {
      return this.go(0);
    },

    last: function() {
      return this.go(this.$items.length - 1);
    },

    next: function() {
      return this.go(this.index + 1);
    },

    previous: function() {
      return this.go(this.index - 1);
    }
  });
}
// you only need to set .id if you are using the "system" loader
factory.id = 'components/carousel';

Atomic.export(module, define, factory);