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

The component below is a "generic" component. Use it for a
component whos logic resides solely in wiring. This is actually
a great choice if as a developer everything you need already
exists in wirings.
*/
var Atomic = (typeof require === 'function') ? require('atomic') : window.Atomic;
Atomic.pack('components/generic', function() { return module; }, function() { return define; }, function() {

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'Generic Component by @jakobo',

    // no dependencies
    depends: [],

    // no additional nodes needed
    elements: {},

    // no events
    events: {},

    // wiring functions to make this work
    init: function() {}
  });
});
