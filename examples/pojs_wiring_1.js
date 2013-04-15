/*global Atomic:true */

/*
This example loads jQuery, and a Carousel

Using the Wiring API, we go beyond the basic Carousel, and add
additional functionality. This allows us turn specified nodes
into "clickable" regions. These regions can report additional data.

This also loads a reusable wiring. The "echo" wiring gives any
component the ability to console.log()
*/
$.ready(function () {
  Atomic.load(['jquery', 'components/Carousel', 'wirings/echo'],
  function ($, Carousel, echoWiring) {
    var carousel;
    carousel = new Carousel($('#carousel'));

    // add some prebuilt reusable wiring
    // gives carousel an "echo" method
    var config = {
      sample: 'config'
    };
    carousel.wireIn(echoWiring(config));

    // add an event, and add extra behavior
    carousel.addEvent('SELECT');
    carousel.wireIn({
      init: function(next, needs, nodes) {
        $('li', $(carousel)).click(function(evt) {
          var out;
          out.url = $('a', this).attr('href');
          out.ponies = $('a', this).data('ponies');
          carousel.trigger(carousel.events.SELECT, out);
          carousel.broadcast(carousel.events.SELECT, out);
        });
        next();
      }
    });

    carousel.load();
  });
});
