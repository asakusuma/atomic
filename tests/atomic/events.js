/*global module:true, test:true, ok:true, __Atomic_Events_API__:true */

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
 * @venus-library qunit
 * @venus-include ../../src/atomic.js
 * @venus-include ../../src/lib/eventemitter2.js
 * @venus-include _harness.js
 * @venus-include ../../src/atomic/events.js
 */

module('event based APIs');
test('has on(), off()', function() {
  ok(__Atomic_Events_API__.on);
  ok(__Atomic_Events_API__.off);
});

test('simple event firing sanity check', function() {
  var triggered = false;
  __Atomic_Events_API__.on('foo', function() {
    triggered = true;
  });

  __Atomic_Events_API__.trigger('foo');
  ok(triggered, 'basic event triggering is working');
});
