/*global module:true, test:true, equal:true, strictEqual:true, ok:true, __Atomic_Public_API__:true */

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
 * @venus-include ../../../src/atomic.js
 * @venus-include _harness.js
 * @venus-include ../../../src/atomic/public.js
 */

module('expand()');
test('allows for argument expansion: converts an array of 3 items to 3 arguments', function() {
  var caller = function(one, two, three) {
    equal(one, 'one', 'is argument 1');
    equal(two, 2, 'is argument 2');
    equal(three, 'three', 'is argument 3');
  };
  var testFn = __Atomic_Public_API__.expand(caller);
  testFn(['one', 2, 'three']);
});

test('arrays size of 1 are the same as arrays size of N', function() {
  var caller = function(one) {
    equal(one, 1, 'has correct argument');
  };
  var testFn = __Atomic_Public_API__.expand(caller);
  testFn([1]);
});

module('proxy()');
test('returns result of proxied function', function() {
	//Works like underscore _.bind
	var obj = {
		count: 8
	};
	var func = function() {
		return this.count;
	};
	equal(__Atomic_Public_API__.proxy(func, obj)(), 8, 'is returned result');
});

module('keys()');
test('returned array has an item for each key', function() {
  var obj = {
    count: 8,
    name: 'John Doe',
    age: 23
  };
  var keys = __Atomic_Public_API__.keys(obj);
  equal(keys.length, 3, 'has correct length');
  equal(keys[0], 'count', 'equals first item');
  equal(keys[1], 'name', 'equals second item');
  equal(keys[2], 'age', 'equals third item');
});

test('items in returned array are all strings', function() {
  var obj = {
    count: 8,
    5: 'John Doe',
    age: 23,
    8: 5
  };
  var keys = __Atomic_Public_API__.keys(obj);
  strictEqual(keys.length, 4, 'has correct length');
  ok(obj[keys[0]], keys[0] + ' found');
  ok(obj[keys[1]], keys[1] + ' found');
  ok(obj[keys[2]], keys[2] + ' found');
  ok(obj[keys[3]], keys[3] + ' found');
});

