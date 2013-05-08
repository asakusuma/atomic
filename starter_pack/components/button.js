/*global require:true, module:true, define:true */

/*
============================================================
STARTER PACK COMPONENTS
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
var Atomic = require('atomic');

function factory() {
  var $ = require('jquery');

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack Button by @jakobo',

    // no dependencies
    needs: {},

    // no additional nodes needed
    nodes: {},

    // events
    events: {
      // TODO from Eric: I know that 'click' isn't used here because we want to
      // include tap events as well.  But USE is very strange.
      USE: 'use'
    },

    // wiring functions to make this work
    wiring: function(needs, nodes) {
      var self = this;
      // nodes._root is the default container, either an el passed
      // to the constructor, or via attach()
      $(nodes._root).on('click', function() {
        self.trigger(self.events.USE);
      });
    }
  });
}
// you only need to set .id if you are using the "system" loader
factory.id = 'components/button';

Atomic.export(module, define, factory);