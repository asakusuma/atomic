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
  function ($, Carousel, Echoer) {
    var carousel;
    carousel = new Carousel($('#carousel'));

    // add some prebuilt reusable wiring
    // gives carousel an "echo" method
    carousel.wireIn(Echoer);

    // add an event, and add extra behavior
    carousel.addEvent('SELECT');
    carousel.wireIn(function(next, needs, nodes) {
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
        carousel.echo(data.url, data.ponies);
      });
    });

  });
});
