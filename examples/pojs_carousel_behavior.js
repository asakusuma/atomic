/*global Atomic:true, console:true */

/*
This example loads jQuery, and a Carousel

Using the Behaviors API, we configure the Selectable Behavior
for carousel, which allows us turn specified nodes into "clickable"
regions. These regions can report additional data.

We use .configure() to set up the contract, and .augment() to
actually alter the carousel. After the alteration, we then have
access to
  carousel.events.SELECTABLE   - new events exposed by the behavior
  carousel.methods.SELECTABLE  - new methods exposed by the behavior
*/
$.ready(function () {
  Atomic.load(['jquery', 'elements/Carousel'],
  function ($, Carousel) {
    var carousel = new Carousel($('#carousel'));

    // configure the carousel's SELECTABLE augmentation
    carousel.configure(carousel.behaviors.SELECTABLE, {
      nodes: 'li',
      data: function (node) {
        var out = {};
        out.url = $('a', node).attr('href');
        out.ponies = $('a', node).data('ponies');
        return out;
      }
    });

    // augment the carousel, and then use our new event for listening
    // immediately
    carousel.augment(carousel.behaviors.SELECTABLE, function () {
      carousel.on(carousel.events.SELECTABLE.SELECT, function (data) {
        console.log(data.url);
        console.log(data.ponies);
      });
    });

  });
});
