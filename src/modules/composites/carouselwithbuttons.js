// carouselwithbuttons
var Atomic = require('atomic'),
    $ = require('jquery'),
    Button = require('components/button'),
    Carousel = require('components/carousel'),
    CarouselWithButtons;

CarouselWithButtons = Atomic.Libs.Fiber.extend(Atomic.AbstractComponent, function (base) {
  return {
    onAttach: function () {
      var $el = $(this.ELEMENT),
          $carousel = $('.carousel', $el),
          $next = $('.next', $el),
          $prev = $('.prev', $el),
          carousel = new Carousel($carousel.get(0));

      // gotta bind them all
      $next.each(function (next) {
        var btn = new Button(next);
        carousel.bind(btn, btn.events.USE, 'next');
      });
      $prev.each(function (prev) {
        var btn = new Button(prev);
        carousel.bind(btn, btn.events.USE, 'previous');
      });
    }
  };
});

module.exports = Button;