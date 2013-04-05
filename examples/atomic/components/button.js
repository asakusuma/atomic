/*global require:true, module:true, define:true */

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

The Component below is one of the simplest Components one can
make. It exposes a generic "USE" event, which is the result
of translating click events on the element itself. jQuery
is used as a convienence, as modern jQuery uses a single
document level listener as opposed to listeners on individual
nodes.
*/

function factory() {

  var Atomic = require('atomic'),
      $ = require('jquery'),
      Button;

  /**
   * The button is an Component that translates mouse behavior into
   * a generic "use" method that can be listened to by other
   * code.
   * @class Button
   * @extends AbstractComponent
   */
  Button = Atomic.OOP.extend(Atomic.AbstractComponent, function (base) {
    return {
      events: {
        /**
         * Triggered when the carousel has exceeded the max # of nodes
         * @event Button#USE
         */
        USE: 'use'
      },

      /**
       * Ran in response to an external load() call
       * This is where the HTML element can be modified
       * call done() when all work is completed
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
else if (this.AtomicRegistry) {
  this.AtomicRegistry['components/button'] = factory;
}