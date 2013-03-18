// carouselwithbuttons
var Atomic = require('atomic'),
    $ = require('jquery'),
    CarouselWithButtons;

CarouselWithButtons = Atomic.Libs.Fiber.extend(Atomic.AbstractComponent, function (base) {
  return {
    has: {
      Carousel: 'components/carousel',
      Button: 'components/button'
    },
    onAttach: function (resolved) {
      var $el = $(this.ELEMENT),
          $carousel = $('.carousel', $el),
          $next = $('.next', $el),
          $prev = $('.prev', $el),
          Carousel = resolved.Carousel,
          Button = resolved.Button,
          carousel = new Carousel($carousel.get(0));

      // gotta bind them all
      $next.each(function (idx, nextEl) {
        var btn = new Button(nextEl);
        carousel.bind(btn, btn.events.USE, 'next');
      });
      $prev.each(function (idx, prevEl) {
        var btn = new Button(prevEl);
        carousel.bind(btn, btn.events.USE, 'previous');
      });
    }
  };
});

module.exports = Button;
