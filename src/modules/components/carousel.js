// carousel
var Atomic = require('atomic'),
    $ = require('jquery'),
    Carousel;

Carousel = Atomic.Libs.Fiber.extend(Atomic.AbstractComponent, function (base) {
  return {
    events: {},
    behaviors: {
      SELECTABLE: { namespace: 'Selectable', path: 'components/carousel/behaviors/selectable' }
    },
    onAttach: function () {}
  };
});

module.exports = Carousel;