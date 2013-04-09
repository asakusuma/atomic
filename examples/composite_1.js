/*global Atomic:true */

/*
This example loads the CarouselWithButtons object

The Composite API allows us to go beyond an Component, adding
functionality for child Components that can be downloaded
and resolved at a later point. We use the "nodes" config to
set up all the pieces CarouselWithButtons will want
*/
$.ready(function () {
  Atomic.load(['jquery', 'composites/carouselwithbuttons'],
  function ($, CWB, Selectable) {
    var $carousel = $('#carousel'),
        cwb;

    cwb = new CWB($carousel, {
      nodes: {
        Carousel: $('#inner-carousel'),
        Next: $('.next', $carousel),
        Previous: $('.prev', $carousel)
      }
    });
  });
});
