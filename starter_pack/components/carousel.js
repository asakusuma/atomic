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

The Carousel Component provides an API for manipulating a
"current" class on a collection of nodes
*/
var Atomic = (typeof require === 'function') ? require('atomic') : window.Atomic;
Atomic.pack('components/carousel', function() { return module; }, function() { return define; }, function() {
  // useful constants in this control
  var $;
  var CURRENT_CLASS = 'current';

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack Carousel by @jakobo',

    // no dependencies
    depends: ['jquery'],

    // no additional nodes needed
    elements: {},

    // events
    events: {
      LAST: 'Fired when the carousel reaches the end: function()',
      FIRST: 'Fired when the carousel reaches the front: function()',
      CHANGE: 'Fired when the carousel changes state: function(lastValue, newValue)'
    },

    /**
     * Main wiring function. Creates internal index and items collections
     * @method Carousel#wiring
     */
    init: function() {
      $ = this.depends('jquery');
      this._index = 0;
      this._$items = null;
      this.refresh();
      this.go(this._index);
    },

    /**
     * refresh the list of nodes inside of this component
     * if you change the DOM structure, you will use this
     * method to update the component
     * @method Carousel#refresh
     * @returns this
     */
    refresh: function() {
      this._$items = $(this.elements()._root).children();
      return this;
    },

    /**
     * Go to a specific item in the collection
     * @method Carousel#go
     * @param {Number} to - the index to advance to
     * @returns this
     */
    go: function(to) {
      if (to < 0 || to > this.size() - 1) {
        return this;
      }

      // trigger our events
      if (to === 0) {
        this.trigger(this.events.FIRST);
      }
      else if (to === this.size() - 1) {
        this.trigger(this.events.LAST);
      }

      this._paint(to);
      return this;
    },

    /**
     * "repaints" the carousel, changing the selected class
     * @method Carousel#_paint
     * @private
     * @param {Number} at - the index to change to
     * @returns this
     */
    _paint: function(at) {
      var lastValue = this._index;

      this._index = at;
      this._$items.removeClass(CURRENT_CLASS);
      this._$items.eq(this._index).addClass(CURRENT_CLASS);
      this.trigger(this.events.CHANGE, lastValue, at);
      return this;
    },

    /**
     * return the reported size of the carousel's items
     * @method Carousel#size
     */
    size: function() {
      return this._$items.size();
    },

    /**
     * Go to the first item in the carousel collection
     * @method Carousel#first
     */
    first: function() {
      return this.go(0);
    },

    /**
     * Go to the last item in the carousel collection
     * @method Carousel#last
     */
    last: function() {
      return this.go(this.size() - 1);
    },

    /**
     * Go to the next item in the carousel collection
     * @method Carousel#next
     */
    next: function() {
      return this.go(this._index + 1);
    },

    /**
     * Go to the previous item in the carousel collection
     * @method Carousel#previous
     */
    previous: function() {
      return this.go(this._index - 1);
    }
  });
});
