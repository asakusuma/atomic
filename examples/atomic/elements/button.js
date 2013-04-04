/*global require:true, module:true, define:true */

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

The Element below is one of the simplest Elements one can
make. It exposes a generic "USE" event, which is the result
of translating click events on the element itself. jQuery
is used as a convienence, as modern jQuery uses a single
document level listener as opposed to listeners on individual
nodes.
*/

function factory() {

  var Atomic = require('atomic'),
      $$ = require('jquery'),
      Button;

  /**
   * The button is an Element that translates mouse behavior into
   * a generic "use" method that can be listened to by other
   * code.
   * @class Button
   * @extends AbstractElement
   */
  Button = Atomic.OOP.extend(Atomic.AbstractElement, function (base) {
    var $ = $$;
    return {
      events: {
        /**
         * Triggered when the carousel has exceeded the max # of nodes
         * @event Button#USE
         */
        USE: 'use'
      },

      /**
       * Ran on element attach
       * @method modify
       */
      modify: function (done) {
        var $el = $(this.ELEMENT),
            button = this;

        $el.on('click', function () {
          button.trigger(button.events.USE);
        });
        done();
      }
    };
  });

  return Button;
}

if (module && module.exports) {
  module.exports = factory();
}
else if (define && define.amd) {
  define(factory);
}
else if (this.AtomicElements) {
  this.AtomicElements['elements/button'] = factory;
}