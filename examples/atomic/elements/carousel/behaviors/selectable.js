/*global require:true, module:true, define:true */

/*
============================================================
BEHAVIORS
============================================================
Behaviors are a way to prevent any one Element from doing
too much. It's too easy to just bolt-on functionality into
an Element to meet a business case. Repeated a dozen times,
the Element becomes unmaintainable due to all the if {}
logic strewn about. Behaviors are a way to yank that
conditional logic out, allowing dynamic extension,
modification, new events, and new methods to be bestowed on
the original Element.

All Behaviors have the option of specifying a `contract`
object. This contract identifies how a configuration must
be set up. In this example, we require the configuration
object literal to contain a "nodes" property, and a "data"
property. The "data" property must be a function.

Any events specified in the Behavior's "events" collection
will be made available on the parent Element under
  instanceName.events.<namespace>.EVENTNAME
where <namespace> is defined by the Element, and EVENTNAME
is the key in the event object's key/value pairing.

Any methods specified in the Behavior's "methods"
collection will be made available on the parent Element
under
  instanceName.methods.<namespace>.methodName
where <namespace> is defined by the Element, and methodName
is the key in the method object's key/value pairing.

The modify() method is automatically invoked after the
contract is completed.
*/

function factory() {
  var Atomic = require('atomic'),
      $$ = require('jquery'),
      CarouselSelectableBehavior;

  /**
   * Enhance a Carousel to make individual "nodes" selectable
   * @class CarouselSelectableBehavior
   * @extends AbstractBehavior
   */
  CarouselSelectableBehavior = Atomic.OOP.extend(Atomic.AbstractBehavior, function (base) {
    var $ = $$;
    return {
      /**
       * @property {Object} CarouselSelectableBehavior.contract - the contract for this behavior
       */
      contract: {
        nodes: true,
        data: {required: false, type: 'function'}
      },

      events: {
        /**
         * @event CarouselSelectableBehavior#SELECTED
         * @param {object} the results of data, provided in the contract
         * @param {number} the index for the item selected
         */
        SELECTED: 'selected'
      },

      methods: {
        /**
         * Disable selectable interactions
         * @method CarouselSelectableBehavior#disable
         */
        disable: function () {
          this.disabled = true;
        },

        /**
         * Enable selectable interactions
         * @method CarouselSelectableBehavior#enable
         */
        enable: function () {
          this.disabled = false;
        }
      },

      /**
       * handle modification
       * @see AbstractBehavior#modify
       */
      modify: function (done) {
        var myself = this;

        $(this.configuration.nodes).on('click', function (evt) {
          if (myself.disabled) {
            return;
          }
          var index = $(myself.configuration.nodes).index(this);
          var results = (myself.configuration.data) ? myself.configuration.data(evt.target) : {};
          myself.trigger(myself.events.SELECTED, results, index);
        });

        done();
      }
    };
  });

  return CarouselSelectableBehavior;
}

if (module && module.exports) {
  module.exports = factory();
}
else if (define && define.amd) {
  define(factory);
}
else if (this.AtomicElements) {
  this.AtomicElements['elements/carousel/behaviors/carouselselectablebehavior'] = factory;
}

