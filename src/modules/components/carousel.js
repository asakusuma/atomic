/*global require:true, module:true */

var Atomic = require('atomic'),
    $$ = require('jquery'),
    Carousel;

/**
 * The carousel is a component that contains a collection of
 * elements, controlled by an API. Items in the carousel that are
 * hidden are given classes of "atomic-hidden", while items in the
 * carousel that are visible are given classes of "atomic-visible".
 * It's up to the end-developer to create CSS classes that support
 * these styles.
 */
Carousel = Atomic.OOP.extend(Atomic.AbstractComponent, function (base) {
  var $ = $$;
  return {
    events: {},
    behaviors: {
      SELECTABLE: { namespace: 'Selectable', path: 'components/carousel/behaviors/selectable' }
    },
    onAttach: function () {}
  };
});

module.exports = Carousel;