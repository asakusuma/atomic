// on document ready, create a carosuel and give
// it SUPER POWERS!!!!111
$.ready(function () {
  Atomic.load(['jquery', 'Carousel'],
  function ($, Carousel) {
    var carousel = new Carousel($('#carousel'));

    carousel.configure(carousel.behaviors.SELECTABLE, {
      nodes: 'li',
      data: function (node) {
        var out = {};
        out.url = $('a', node).attr('href');
        out.foo = $('a', node).data('fooness');
        return out;
      }
    });

    carousel.configure(carousel.behaviors.DRAGGABLE, {
      /* config draggable */
    })

    carousel.augment(carousel.behaviors.SELECTABLE, function () {
      // ran when all augmentation is complete
      carousel.on(carousel.events.SELECTABLE.SELECT, function (data) {
        console.log(data.url);
        console.log(data.foo);
      });
    });

  });
});
