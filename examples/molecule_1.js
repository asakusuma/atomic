/*global Atomic:true */

/*
This example loads the CarouselWithButtons object

The Molecule API allows us to go beyond an Element, adding
functionality for child Elements which can be downloaded
and resolved on element attachment. All molecules come with
a set of configurable and augmentable calls, accessible from
the .molecule namespace.
*/
$.ready(function () {
  Atomic.load(['jquery', 'molecules/carouselwithbuttons'],
  function ($, CWB) {
    var $carousel = $('#carousel'),
        cwb = new CWB($carousel);

    cwb.configure(cwb.molecule.COMBINE, {
      Carousel: $('#inner-carousel'),
      Next: $('.next', $carousel),
      Previous: $('.prev', $carousel)
    });
    cwb.augment(cwb.molecule.COMBINE, function () {
      cwb.load();
    });

  });
});
