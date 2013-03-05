// carousel
var Trinket = require('trinket'),
    $ = require('jquery'),
    Carousel;

Carousel = Trinket.Libs.Fiber.extend(Trinket.AbstractComponent, function (base) {
  return {
    events: {},
    behaviors: {
      SELECTABLE: { namespace: 'Selectable', path: 'components/carousel/behaviors/selectable' }
    },
    onAttach: function () {}
  };
});

module.exports = Button;