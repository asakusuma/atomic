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
"current" class on a collection of nodes
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
    nodes: {},

    // events
    events: {
      END: 'end',
      FIRST: 'first'
    },

    // wiring functions to make this work
    wiring: function(needs, nodes) {
      this.index = 0;
      this._nodes = nodes;
      this.refresh();
      this.go(this.index);
    },

    refresh: function() {
      this._$items = $(this.nodes._root.children);
    },

    go: function(to) {
      if (to < 0 || to > this.size() - 1) {
        return this;
      }
      this.index = to;
      this._$items.removeClass(CURRENT_CLASS);
      this._$items.eq(this.index).addClass(CURRENT_CLASS);
      return this;
    },

    size: function() {
      return this._$items.length;
    },

    first: function() {
      return this.go(0);
    },

    last: function() {
      return this.go(this.size() - 1);
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