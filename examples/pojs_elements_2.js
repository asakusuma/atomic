/*global Atomic:true */

/*
This example loads jQuery, the Button, and the Carousel

It then associates next/previous actions with the carousel's
public API for advancing/rewinding.

This example uses the .bind() interface, and uses a string to
invoke a late-binding. If carousel doens't have a "next", it will
only be uncovered when responding to the event. This has the
added bonus of only using the method "when you need it", but
makes error tracing harder.
*/
$.ready(function () {
  Atomic.load(['jquery', 'components/Button', 'components/Carousel'],
  function ($, Button, Carousel) {
    var next = new Button($('#next')),
        prev = new Button($('#prev')),
        carousel = new Carousel($('#carousel'));

    carousel.bind(next, next.events.USE, 'next');
    carousel.bind(prev, prev.events.USE, 'previous');
  });
});
