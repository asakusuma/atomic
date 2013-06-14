/*global require:true, module:true, define: true */
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
This starter pack wiring adds events for detecting "bottoming out"
on a container. Bottoming out can happen one of two ways:
  * The window is scrolled such that the bottom of the container is
    visible in the viewport
  * The container is scrolled such that the bottom of the container
    is reached

In either case, a "BOTTOMOUT" event is fired

It can be configured with the following options:
  * tolerance(int) a number of pixels before the "bottom" the event fires
  * direction(string) either an 'x' or 'y', indicating the scroll direciton
    to care about
  * local(boolean) if true, the local container will be watched instead of
    the window
*/
var Atomic = (typeof require !== 'undefined') ? require('atomic') : window.Atomic;

function definition() {
  return function(config) {
    var $;

    config = config || {};
    config.delay = config.delay || 300;
    config.direction = config.direction || 'y';
    config.local = config.local || false;
    config.tolerance = config.tolerance || 300;

    return {
      events: {
        'BOTTOMOUT': 'occurs when the container bottoms out'
      },
      init: function() {
        $ = this.needs('jquery');
        var last = 0;
        var maximum = 0;
        var self = this;
        var $root = $(this.nodes()._root);
        var $window = $(window);
        if (config.local) {
          $root.on('scroll', Atomic.debounce(function() {
            var scroll = (config.direction === 'x') ? $root.scrollLeft() : $root.scrollTop();
            if (scroll <= last) {
              return;
            }
            last = scroll;
            maximum = (config.direction === 'x') ? $root.width() : $root.height();
            if (last + config.tolerance > maximum) {
              self.trigger(self.events.BOTTOMOUT);
            }
          }, config.delay));
        }
        else {
          $window.on('scroll', Atomic.debounce(function() {
            var scroll = (config.direction === 'x') ? $window.scrollLeft() : $window.scrollTop();
            if (scroll <= last) {
              return;
            }
            last = scroll;
            maximum = ((config.direction === 'x') ? $root.offset().left + $root.width() : $root.offset().top + $root.height());
            if (last + $window.height() > maximum - config.tolerance) {
              self.trigger(self.events.BOTTOMOUT);
            }
          }, config.delay));
        }
      }
    };
  };
}
// you only need to set .id if you are using the "system" loader
definition.id = 'wirings/bottoming';

try { Atomic.export(module, define, definition); } catch(e) { Atomic.export(definition); }