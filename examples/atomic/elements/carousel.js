/*global require:true, module:true, define: true */

/*
============================================================
ELEMENTS
============================================================
Elements are the building blocks of rich UIs. Their purpose
in life is to augment an existing HTML element on the page
and make it produce new events, accept additional
configuration, and add/remove classes as required. By
default, Elements do not depend on anything other than Atomic
itself. Often times, developers will use a DOM Library such
as YUI or jQuery to make the DOM operations easier.

The Element below shows how to expose a public API to external
items. Additionally, it shows how inside of onAttach(), smart
node selection can be used to catch errant use cases.

Lastly, the Element below supports a Behavior, known as
SELECTABLE. If configured, the SELECTABLE behavior can add
the ability to "click" on any element within the Carousel and
extract data.

This Element makes use of the constructor to set up some
variables. It's important to call the base's constructor after
you are done, otherwise there won't be an event system ready
for you.
*/

function factory() {

  var Atomic = require('atomic'),
      $$ = require('jquery'),
      Carousel;

  /**
   * The carousel is a component that contains a collection of
   * html items, controlled by an API. Items in the carousel that are
   * hidden are given classes of "atomic-hidden", while items in the
   * carousel that are visible are given classes of "atomic-visible".
   * It's up to the end-developer to create CSS classes that support
   * these styles.
   * @class Carousel
   * @extends AbstractElement
   */
  Carousel = Atomic.OOP.extend(Atomic.AbstractElement, function (base) {
    var $ = $$;
    return {
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

      behaviors: {
        /**
         * @property {Object} behaviors.SELECTABLE - makes elements of a carousel individually selectable
         */
        SELECTABLE: { namespace: 'Selectable', path: 'elements/carousel/behaviors/selectable' }
      },

      init: function () {
        this.index = 0;
        base.prototype.init.apply(this, arguments);
      },

      /**
       * Ran on element attach
       * @method Carousel@modify
       */
      modify: function (done) {
        switch(this.ELEMENT.tagName.toLowerCase()) {
        case 'ul':
          this._nodes = $(this.ELEMENT).children('li');
          break;
        case 'div':
          this._nodes = $(this.ELEMENT).children('div, span');
          break;
        default:
          throw new Error('Unhandled node type for Carousel: '+this.ELEMENT.tagName);
        }

        this._$nodes = $(this._nodes);

        this._setClasses();

        done();
      },

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
    };
  });

  return Carousel;
}

if (module && module.exports) {
  module.exports = factory();
}
else if (define && define.amd) {
  define(factory);
}
else if (this.AtomicElements) {
  this.AtomicElements['elements/carousel'] = factory;
}