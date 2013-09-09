/*global require:true, module:true, define:true */
/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

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
var Atomic = (typeof require === 'function') ? require('atomic') : window.Atomic;
Atomic.pack('components/button', function() { return module; }, function() { return define; }, function() {
  var $;

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack Button by @jakobo',

    // no dependencies
    depends: ['jquery'],

    // no additional nodes needed
    elements: {},

    // events
    events: {
      // TODO from Eric: I know that 'click' isn't used here because we want to
      // include tap events as well.  But USE is very strange.
      USE: 'Triggered when the button is used'
    },

    // wiring functions to make this work
    init: function() {
      $ = this.depends('jquery');
      var self = this;
      // nodes._root is the default container, either an el passed
      // to the constructor, or via attach()
      $(self.elements()._root).on('click', function() {
        self.trigger(self.events.USE);
      });
    }
  });
});