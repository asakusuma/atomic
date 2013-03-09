// on document ready, create a carosuel and two buttons.
// make the buttons control the carousel
$.ready(function () {
  Atomic.load(['jquery', 'Button', 'Carousel'],
  function ($, Button, Carousel) {
    var next = new Button($('#next')),
        prev = new Button($('#prev')),
        carousel = new Carousel($('#carousel'));

    carousel.bind(next, next.events.USE, carousel.next);
    carousel.bind(prev, prev.events.USE, carousel.previous);
    // or...
    carousel.bind(next, next.events.USE, 'next');
    carousel.bind(prev, prev.events.USE, 'previous');
    // or...
    next.on(next.events.USE, function () {
      carousel.next();
    });
    prev.on(next.events.USE, function () {
      carousel.previous();
    });
  });
});
