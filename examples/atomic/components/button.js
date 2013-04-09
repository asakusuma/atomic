/*global require:true, module:true, define:true */

/*
============================================================
COMPONENTS
============================================================
Components are the building blocks of rich UIs. Their purpose
in life is to augment an existing HTML element on the page
and make it produce new events, accept additional
configuration, and add/remove classes as required. By
default, Components do not depend on anything other than Atomic
itself. Often times, developers will use a DOM Library such
as YUI or jQuery to make the DOM operations easier.

The Component below is one of the simplest Components one can
make. It exposes a generic "USE" event, which is the result
of translating click events on the element itself. jQuery
is used as a convienence, as modern jQuery uses a single
document level listener as opposed to listeners on individual
nodes.
*/

function factory() {
  var $ = require('jquery');
  var Atomic = require('atomic');

  // calls the Atomic Component constructor
  return Atomic.Component({

    // no dependencies
    needs: {},

    // no additional nodes needed
    actors: {},

    // events
    events: {
      USE: 'use'
    },

    // wiring functions to make this work
    wiring: [
      function(next, needs, actors) {
        var self = this;
        // actors.default is the default container, either an el passed
        // to the constructor, or via attach()
        $(actors.element).on('click', function() {
          self.trigger(self.events.USE);
        });
        next();
      }
    ]
  });
}

if (module && module.exports) {
  module.exports = factory();
}
else if (define && define.amd) {
  define(factory);
}
else if (this.AtomicRegistry) {
  this.AtomicRegistry['components/button'] = factory;
}