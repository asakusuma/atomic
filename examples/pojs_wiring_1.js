/*global Atomic:true */

/*
This example loads jQuery, and a Carousel

Using the Wiring API, we go beyond the basic Carousel, and add
additional functionality. This allows us turn specified nodes
into "clickable" regions. These regions can report additional data.

This also loads a reusable wiring. The "echo" wiring gives any
component the ability to console.log()

Finally, this example makes use of promises to make the last
manual wiring asynchronous.
*/
$.ready(function () {
  Atomic.load(['jquery', 'components/Carousel', 'wirings/echo'],
  function ($, Carousel, echoWiring) {
    var carousel;
    var $carousel = $('#carousel');

    carousel = new Carousel($carousel);

    /*
     * This is an example of using a prebuilt wiring. Grab,
     * configure(), and go
    */
    var config = {
      sample: 'config'
    };
    carousel.wireIn(echoWiring(config));

    /*
     * This is an example of using the wireIn function to
     * manually add more functionality. This adds a SELECT
     * method, and then adds additional initialization
     * steps. This wiring converts clicks on LI links to
     * Atomic events.
     */
    carousel.addEvent('SELECT');
    carousel.wireIn({
      init: function(needs, nodes) {
        // this === carousel
        $('li', $(carousel)).click(function(evt) {
          evt.stopEvent();
          var out;
          out.url = $('a', this).attr('href');
          out.ponies = $('a', this).data('ponies');
          carousel.trigger(carousel.events.SELECT, out);
          carousel.broadcast(carousel.events.SELECT, out);
        });
      }
    });

    /**
     * This is an example of using the wireIn function to
     * manually add more functionality. Unlike the previous
     * version, this contains asynchronous operations that
     * are solved by using Atomic.promise(). This promise
     * has two methods: resolve() and reject() which will
     * notify the wiring chain how to proceed.
     */
    carousel.wireIn({
      init: function(needs, nodes) {
        var promise = Atomic.promise();
        $.get('http://example.com/get/more/li_elements.html')
        .success(function(data) {
          $carousel.append(data);
          promise.resolve();
        })
        .error(function(err) {
          promise.reject(err);
        });
        return promise;
      }
    });

    carousel.load();
  });
});
