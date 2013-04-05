/*global Atomic:true */

/*
This example loads jQuery, the Button, and the Carousel

It then associates next/previous actions with the carousel's
public API for advancing/rewinding.

This example uses the direct .on() interface exposed by the
button objects. Like any event listener, they can receive
paramerers. We use the event callbacks to call methods on the
carousel.
*/
$.ready(function () {
  Atomic.load(['jquery', 'components/Button', 'components/Carousel'],
  function ($, Button, Carousel) {
    var next = new Button($('#next')),
        prev = new Button($('#prev')),
        carousel = new Carousel($('#carousel'));

    next.on(next.events.USE, function () {
      carousel.next();
    });
    prev.on(next.events.USE, function () {
      carousel.previous();
    });
  });
});
