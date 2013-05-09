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

function definition() {
  var $ = require('jquery');

  var CURRENT_CLASS = 'current';

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack Carousel by @jakobo',

    // no dependencies
    needs: [],

    // no additional nodes needed
    nodes: {},

    // events
    events: {
      END: 'Fired when the carousel reaches the end',
      FIRST: 'Fired when the carousel reaches the front'
    },

    /**
     * Main wiring function. Creates internal index and items collections
     */
    wiring: function() {
      this._index = 0;
      this._$items = null;
      this.refresh();
      this.go(this._index);
    },

    /**
     * refresh the list of nodes inside of this component
     * if you change the DOM structure
     * @method Carousel#refresh
     */
    refresh: function() {
      this._$items = $(this.nodes()._root).children();
      return this;
    },

    /**
     * Go to a specific item in the collection
     * @method Carousel#go
     * @param {Number} to - the index to advance to
     */
    go: function(to) {
      if (to < 0 || to > this.size() - 1) {
        return this;
      }
      this._index = to;
      this._$items.removeClass(CURRENT_CLASS);
      this._$items.eq(this._index).addClass(CURRENT_CLASS);
      return this;
    },

    /** 
     * return the reported size of the carousel's items
     * @method Carousel#size
     */
    size: function() {
      return this._$items.size();
    },

    /**
     * Go to the first item in the carousel collection
     * @method Carousel#first
     */
    first: function() {
      return this.go(0);
    },

    /**
     * Go to the last item in the carousel collection
     * @method Carousel#last
     */
    last: function() {
      return this.go(this.size() - 1);
    },

    /**
     * Go to the next item in the carousel collection
     * @method Carousel#next
     */
    next: function() {
      return this.go(this._index + 1);
    },

    /**
     * Go to the previous item in the carousel collection
     * @method Carousel#previous
     */
    previous: function() {
      return this.go(this._index - 1);
    }
  });
}
// you only need to set .id if you are using the "system" loader
definition.id = 'components/carousel';

Atomic.export(module, define, definition);