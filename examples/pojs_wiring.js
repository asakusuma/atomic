/*global Atomic:true, console:true */

/*
This example loads jQuery, and a Carousel

Using the Wiring API, we go beyond the basic Carousel, and add
additional functionality. This allows us turn specified nodes
into "clickable" regions. These regions can report additional data.
*/
$.ready(function () {
  Atomic.load(['jquery', 'components/Carousel'],
  function ($, Carousel) {
    var carousel;
    carousel = new Carousel($('#carousel'));

    // add an event, and add extra behavior
    Carousel.addEvent(carousel, 'SELECT');
    carousel.wireIn(function(next, needs, actors) {
      $('li', $(carousel)).click(function(evt) {
        var out;
        out.url = $('a', this).attr('href');
        out.ponies = $('a', this).data('ponies');
        carousel.trigger(carousel.events.SELECT, out);
      });
    });

    // uses a callback on load to listen after all wiring is done
    carousel.load(function () {
      carousel.on(carousel.events.SELECT, function(data) {
        console.log(data.url, data.ponies);
      });
    });

  });
});
