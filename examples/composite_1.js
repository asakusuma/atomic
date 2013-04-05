/*global Atomic:true */

/*
This example loads the CarouselWithButtons object

The Composite API allows us to go beyond an Component, adding
functionality for child Components that can be downloaded
and resolved at a later point. All Composites come with
a set of configurable and augmentable calls, accessible from
the .composite namespace.
*/
$.ready(function () {
  Atomic.load(['jquery', 'composites/carouselwithbuttons'],
  function ($, CWB) {
    var $carousel = $('#carousel'),
        cwb = new CWB($carousel);

    cwb.configure(cwb.composite.ACTORS, {
      Carousel: $('#inner-carousel'),
      Next: $('.next', $carousel),
      Previous: $('.prev', $carousel)
    });
    cwb.augment(cwb.composite.ACTORS, function () {
      cwb.load();
    });

  });
});
