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
(function(define) {
  define('components/textinput', ['Atomic/Component'], function(Component) {
    var $;

    // calls the Atomic Component constructor
    return Component({
      // the ID for this component
      id: 'components/textinput',
    
      // a common name to assist in debugging
      name: 'SamplePack Text Input by @asakusuma',

      // no dependencies
      depends: ['jquery'],

      // no additional nodes needed
      elements: {},

      // events
      events: {
        CHANGED: 'Triggered when the text is changed'
      },
      
      // states
      states: {
        text: 'the text value currently in the text input component'
      },

      render: function() {
        var text = this.state('text');
        $(this.elements().root).val(text);
      },

      // wiring functions to make this work
      init: function() {
        $ = this.depends('jquery');
        this.state('text', '');
        var self = this;
        // nodes.root is the default container, either an el passed
        // to the constructor, or via attach()
        $(self.elements().root).keyup(function(e) {
          var text = $(e.currentTarget).val();
          self.state('text', text);
          self.trigger(self.events.CHANGED, text);
        });
      }
    });
  });
}(typeof define == 'function' && define.amd ? define : Atomic));