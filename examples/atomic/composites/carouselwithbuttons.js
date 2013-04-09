/*global require:true, module:true, define: true */

/*
Carousel with buttons is an example Composite.
Composites are like Components, only there is an explcit
ownership pattern between the Composite and the Components
contained within.
*/
var Atomic = require('atomic');

function factory() {
  var $ = require('jquery');

  /**
   * The carousel with buttons is a mashery of carousel and buttons, and is
   * a great example of how you can put smaller pieces together to make a
   * reusable "larger piece". In the class description, you should also explain
   * the contract expected by this object.
   *
   * CarouselWithButtons expects the following nodes to be defined in the nodes{}
   * configuration
   * - Carousel: will be turned into a carousel Component
   * - Next: all references will be turned into buttons that advance the carousel
   * - Previous: all references will be turned into buttons that rewind the carousel
   *
   * @class CarouselWithButtons
   */
  return Atomic.Composite({
    needs: {
      /**
       * Declares dependencies used within this Composite
       * @requires components/carousel
       * @requires components/button
       */
      Carousel: 'components/carousel',
      Button: 'components/button'
    },

    /**
     * Declares "nodes", additional HTML Elements required
     * usually all nodes need to be fulfilled for a
     * Composite to work correctly.
     */
    nodes: {
      Carousel: null,
      Next: null,
      Previous: null
    },

    // this has no events of its own
    events: {},

    /**
     * these are the series of function(s) to be ran when the
     * end developer calls load()
     */
    wiring: [
      function(next, needs, nodes) {
        var c = new needs.Carousel(nodes.Carousel);
        var self = this;
        var btn;

        this.carousel = c;
        this._nextButtons = [];
        this._previousButtons = [];

        $.each(nodes.Next, function(idx, el) {
          btn = new needs.Button(el);
          btn.on(btn.events.USE, function() {
            c.next();
          });
          btn.load();
          self._nextButtons.push(btn);
        });
        $.each(nodes.Previous, function(idx, el) {
          btn = new needs.Button(el);
          btn.on(btn.events.USE, function() {
            c.previous();
          });
          btn.load();
          self._previousButtons.push(btn);
        });

        c.load();
        next();
      }
    ]
  });
}
// you only need to set .id if you are using the "system" loader
factory.id = 'composites/carosuelwithbuttons';

Atomic.export(module, define, factory);
