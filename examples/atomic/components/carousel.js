/*global require:true, module:true, define: true */

/*
============================================================
COMPONENTS
============================================================
Components are the building blocks of rich UIs. Their purpose
in life is to augment an existing HTML element on the page
and make it produce new events, accept additional
configuration, and add/remove classes as required. By
default, Components do not depend on anything other than Atomic
itself. Often times, developers will use a DOM Library such
as YUI or jQuery to make the DOM operations easier.

The Component below shows how to expose a public API to external
items. Additionally, it shows how inside of the wiring[]
collection, you can make individual controls smarter and more
reliable, including catching error cases.

This Component makes use of the wiring[] to set up some
variables.
*/

function factory() {
  var $ = require('jquery');
  var Atomic = require('atomic');

  // calls the Atomic Component constructor
  return Atomic.Component({

    // no dependencies
    needs: {},

    // no additional nodes needed
    actors: {},

    // events
    events: {
      /**
       * Triggered when the carousel has exceeded the max # of nodes
       * @event Carousel#OUT_OF_BOUNDS_HIGH
       */
      OUT_OF_BOUNDS_HIGH: 'out_of_bounds_high',
      /**
       * Triggered when the carousel has attempted to go before the first node
       * @event Carousel#OUT_OF_BOUNDS_LOW
       */
      OUT_OF_BOUNDS_LOW: 'out_of_bounds_low'
    },

    // wiring functions to make this work
    wiring: [
      function(next, needs, actors) {
        this.index = 0;
        next();
      },
      function(next, needs, actors) {
        switch(actors.element.tagName.toLowerCase()) {
        case 'ul':
          this._nodes = $(actors.element).children('li');
          break;
        case 'div':
          this._nodes = $(actors.element).children('div, span');
          break;
        default:
          throw new Error('Unhandled node type for Carousel: '+actors.element.tagName);
        }

        this._$nodes = $(this._nodes);

        this._setClasses();

        next();
      }
    ],

    /**
     * Advance the carousel to the next item
     * @method Carousel#next
     */
    next: function () {
      this.index++;
      if (this.index > this._$nodes.size() - 1) {
        // out of bounds
        this.trigger(this.events.OUT_OF_BOUNDS_HIGH);
        this.index = this._$nodes.size() - 1;
      }
      this._setClasses();
    },

    /**
     * Return the carousel to the previous item
     * @method Carousel#previous
     */
    previous: function () {
      this.index--;
      if (this.index < 0) {
        // out of bounds
        this.trigger(this.events.OUT_OF_BOUNDS_LOW);
        this.index = 0;
      }
      this._setClasses();
    },

    /**
     * Set the carousel to the first item in the collection
     * @method Carousel#first
     */
    first: function () {
      this.index = 0;
      this._setClasses();
    },

    /**
     * Set the carousel to the last item in the collection
     * @method Carousel#lasr
     */
    last: function () {
      this.index = this._$nodes.size() - 1;
      this._setClasses();
    },

    /**
     * Set the classes correctly based on the index
     * @method Carousel#_setClasses
     * @private
     */
    _setClasses: function () {
      this._$nodes.removeClass(Atomic.CONSTANTS.classes.visible);
      this._$nodes.removeClass(Atomic.CONSTANTS.classes.hidden);
      this._$nodes.eq(this.index).addClass(Atomic.CONSTANTS.classes.visible);
    }
  });
}

if (module && module.exports) {
  module.exports = factory();
}
else if (define && define.amd) {
  define(factory);
}
else if (this.AtomicRegistry) {
  this.AtomicRegistry['components/button'] = factory;
}
