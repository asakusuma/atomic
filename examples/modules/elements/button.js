/*global require:true, module:true */

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
     * @method onAttach
     */
    onAttach: function () {
      var $el = $(this.ELEMENT),
          button = this;

      $el.on('click', function () {
        button.trigger(button.events.USE);
      });
    }
  };
});

module.exports = Button;