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

var Atomic = (typeof require === 'function') ? require('atomic') : window.Atomic;
Atomic.pack('components/controlledcarousel', function() { return module; }, function() { return define; }, function() {
  // useful constants in this control
  var $;
  var CURRENT_CLASS = 'current';

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack ControlledCarousel by @jakobo',

    // no dependencies
    depends: ['jquery', 'components/carousel', 'components/button'],

    // no additional nodes needed
    elements: {
      'Previous': 'This node when interacted with will reverse the carousel one position',
      'Next': 'This node when interacted with will advance the carousel one position',
      'First': 'This node when interacted with will return the carousel to the first position',
      'Last': 'This node when interacted with will advance the carousel to the last position'
    },

    // events
    events: {
      LAST: 'Fired when the internal carousel reaches the end: function()',
      FIRST: 'Fired when the internal carousel reaches the front: function()',
      CHANGE: 'Fired when the internal carousel changes state: function(lastValue, newValue)'
    },

    /**
     * Main wiring function. Creates internal index and items collections
     * @method ControlledCarousel#wiring
     */
    init: function() {
      $ = this.depends('jquery');
      var Carousel = this.depends('components/carousel');
      var Button = this.depends('components/button');
      var self = this;
      var buttons = {};

      var carousel = new Carousel(this.elements()._root);
      carousel.on(carousel.events.LAST, function() {
        self.trigger(self.events.LAST);
      })
      .on(carousel.events.FIRST, function() {
        self.trigger(self.events.FIRST);
      })
      .on(carousel.events.CHANGE, function(lastValue, newValue) {
        self.trigger(self.events.CHANGE, lastValue, newValue);
      });

      if (this.elements().First) {
        buttons.First = new Button(this.elements().First);
        carousel.bind(buttons.First, buttons.First.events.USE, 'first');
        buttons.First.load();
      }

      if (this.elements().Last) {
        buttons.Last = new Button(this.elements().Last);
        carousel.bind(buttons.Last, buttons.Last.events.USE, 'last');
        buttons.Last.load();
      }

      if (this.elements().Previous) {
        buttons.Previous = new Button(this.elements().Previous);
        carousel.bind(buttons.Previous, buttons.Previous.events.USE, 'previous');
        buttons.Previous.load();
      }

      if (this.elements().Next) {
        buttons.Next = new Button(this.elements().Next);
        carousel.bind(buttons.Next, buttons.Next.events.USE, 'next');
        buttons.Next.load();
      }

      // load() returns a promise
      return carousel.load();
    }
  });
});
