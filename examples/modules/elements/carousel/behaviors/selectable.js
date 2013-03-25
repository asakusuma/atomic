/*global require:true, module:true */

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

module.exports = CarouselSelectableBehavior;

