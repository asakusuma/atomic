/*global Atomic:true */

/*
This example loads jQuery, the Button, and the Carousel

It then associates next/previous actions with the carousel's
public API for advancing/rewinding.

This example uses the .bind() interface, attaching to the existing
functions on the carousel object.
*/
$.ready(function () {
  Atomic.load(['jquery', 'elements/Button', 'elements/Carousel'],
  function ($, Button, Carousel) {
    var next = new Button($('#next')),
        prev = new Button($('#prev')),
        carousel = new Carousel($('#carousel'));

    carousel.bind(next, next.events.USE, carousel.next);
    carousel.bind(prev, prev.events.USE, carousel.previous);
  });
});
