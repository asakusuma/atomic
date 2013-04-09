/*global require:true, module:true, define: true */

/*
Carousel with buttons is an example Composite.
Composites are like Components, only there is an explcit
ownership pattern between the Composite and the Components
contained within.
*/
function factory() {

  var Atomic = require('atomic'),
      $ = require('jquery'),
      CarouselWithButtons;

  /**
   * The carousel with buttons is a mashery of carousel and buttons, and is
   * a great example of how you can put smaller pieces together to make a
   * reusable "larger piece". In the class description, you should also explain
   * the contract expected by this object.
   *
   * CarouselWithButtons expects the following nodes to exist within the
   * top level element:
   * - .carousel will be turned into a carousel Component
   * - .next all references will be turned into buttons that advance the carousel
   * - .prev all references will be turned into buttons that rewind the carousel
   *
   * @class CarouselWithButtons
   * @extends AbstractComposite
   */
  CarouselWithButtons = Atomic.OOP.extend(Atomic.AbstractComposite, function (base) {
    return {
      /**
       * Declares dependencies used within this Composite
       * @requires components/carousel
       * @requires components/button
       */
      has: {
        Carousel: 'components/carousel',
        Button: 'components/button'
      },

      /**
       * Declares "actors", additional HTML Elements required
       * usually all actors need to be fulfilled for a
       * Composite to work correctly.
       */
      actors: ['Carousel', 'Next', 'Previous'],

      // this Composite has no events unique to itself
      events: {},

      /**
       * method ran in response to an external load() call
       * @see AbstractComposite#load
       */
      modify: function (done, resolved, actors) {
        var $el = $(this.ELEMENT),
            Carousel = resolved.Carousel,
            Button = resolved.Button,
            carousel = new Carousel(actors.Carousel),
            self = this;

        // expose a jQuery wrapped object
        // While not required, this is a good practice if
        // you want to reuse the jQuery object
        this.$el = $el;

        // We are comfortable as the composite maintainer
        // with people maniuplaing the carousel directly
        // via its public APIs and listening to its methods
        // As a developer, you should ensure carousel has
        // all the necessary events so that CarouselWithButtons
        // can tell when its carousel changes.
        this.carousel = carousel;

        // Private members can help lend insights into
        // the object's inner workings
        // External groups shouldn't call these, but they may
        // wish to console.log them
        this._nextButtons = [];
        this._prevButtons = [];

        // maybe we want to store the resolved object
        // for other methods in CarouselWithButtons
        this._Carousel = Carousel;

        // gotta bind them all
        // In order to improve debugging, remember to add
        // these objects to the _nextButtons and _prevButtons
        $.each(actors.Next, function (idx, nextEl) {
          var btn = new Button(nextEl);
          self._nextButtons.push(btn);
          carousel.bind(btn, btn.events.USE, 'next');
          btn.load();
        });
        $.each(actors.Previous, function (idx, prevEl) {
          var btn = new Button(prevEl);
          self._prevButtons.push(btn);
          carousel.bind(btn, btn.events.USE, 'previous');
          btn.load();
        });

        carousel.load(function () {
          done();
        });
      }
    };
  });

  return CarouselWithButtons;
}

if (module && module.exports) {
  module.exports = factory();
}
else if (define && define.amd) {
  define(factory);
}
else if (this.AtomicRegistry) {
  this.AtomicRegistry['composites/carouselwithbuttons'] = factory;
}