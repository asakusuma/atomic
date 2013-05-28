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

The Select Component provides an API for manipulating a
"current" class on a collection of nodes
*/
var Atomic = require('atomic');

function definition() {
  // useful constants in this control
  var $ = require('jquery');

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack Select by @erowell',

    // no dependencies
    needs: [],

    // no additional nodes needed
    nodes: {},

    // events
    events: {},

    /**
     * Main wiring function
     * @method Select#wiring
     */
    wiring: function() {
      var node = this.node = this.getRoot();

      $(node).hide();
      console.log('select init');
    }


  });
}
// you only need to set .id if you are using the "system" loader
definition.id = 'components/select';

Atomic.export(module, define, definition);