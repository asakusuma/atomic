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
ATOMIC TESTING HARNESS
======================
This file creates an Atomic.Test namespace, which provides assistance in testing
Atomic Components. Most notably:

* You can create "fake" components with Atomic.Test.fakeComponent()
* You can set global dependencies like jQuery with Atomic.Test.define()
* Atomic.pack and Atomic.load use an internal loading system to allow for
  dependency injection
*/

Atomic.version = 'TEST-' + Atomic.version;
Atomic.Test = {};
Atomic.Test.__loads = {};
Atomic.Test.__packs = {};
Atomic.Test.methods = {};
Atomic.Test.methods.pack = Atomic.pack;
Atomic.Test.methods.Component = Atomic.Component;
Atomic.Test.methods.load = Atomic.load;

/**
 * resets the environment, making all dependencies invalid again
 * useful in an after() or cleanup() type method within your unit test
 * @method Atomic.Test.resetEnv
 */
Atomic.Test.resetEnv = function() {
  Atomic.Test.__packs = {};
  Atomic.Test.__loads = {};
};

/**
 * Pre-resolve an outcome for Atomic.load()
 * useful for testing your page-level JavaScript, where you want to
 * call Atomic.load() with everything already set up for you
 * @method Atomic.Test.resolve()
 * @param {String} name - the name you would like to resolve
 * @param {Object} obj - the object you would like "name" to resovle to
 */
Atomic.Test.resolve = function(name, obj) {
  Atomic.Test.__loads[name] = obj;
};

/**
 * Get a predefined pack, usually from loading Atomic.pack() in
 * a testing environment
 * @method Atomic.Test.getPack()
 * @param {String} id - the pack ID to return
 * @returns obj
 */
Atomic.Test.getPack = function(id) {
  return Atomic.Test.__packs[id];
};

/**
 * Creates a fake Atomic Component, without any functioning methods
 * This shell function makes it possible to create an Atomic component
 * that will not trigger any dependency requirements, and offers all
 * of the methods and events a component may have.
 *
 * A fake component definition is an object literal with the following
 * keys defined
 *
 * - events (array) an array of event names this component will use
 * - methods (array) an array of methods this component will expose
 * - id (string) an id for this component. Useful for debugging
 *
 * @method Atomic.Test.fakeComponent
 * @param {Object} def - component definition
 */
Atomic.Test.fakeComponent = function(def) {
  var obj = {
    depends: [],
    name: 'Mock of ' + def.id,
    events: {},
	init: function() {}
  };

  var newFn = function() {
    return function() {};
  };

  var i;

  if (def.methods) {
    for (i = 0, len = def.methods.length; i < len; i++) {
      obj[def.methods[i]] = newFn();
    }
  }

  if (def.events) {
    for (i = 0, len = def.events.length; i < len; i++) {
      obj.events[def.events[i]] = 'Mock event from fakeComponent()';
    }
  }

  var component = Atomic.Component(obj);
  return component;
};

/**
 * Replaces the Atomic.pack() function
 * This new function writes to an internal component registry
 * @method Atomic.pack
 */
Atomic.pack = function(id, m, d, factory) {
  Atomic.Test.__packs[id] = factory();
};

/**
 * Current a placeholder, passes through to Atomic.Component
 * It is likely we will need to alter the way component generation
 * works, but it's unknown in which ways yet
 * @method Atomic.Component
 */
Atomic.Component = function(definition) {
  return Atomic.Test.methods.Component(definition);
};

/**
 * Replaces Atomic.load, and ensures you cannot call it while in testing
 * mode. This helps to make sure you are testing in isolation and that your
 * dependencies have been properly mocked.
 */
Atomic.load = function() {
  var deps = [].slice.call(arguments, 0);
  var resolved = [];
  var deferred = Atomic.deferred();

  for (var i = 0, len = deps.length; i < len; i++) {
    comp = Atomic.Test.__components[deps[i]];
    resolved.push(comp);
  }
  
  if (resolved.length !== deps.length) {
    throw new Error('one or more dependencies were not resolved before Atomic.load was called. ' +
      'Provide local component dependencies with component.resolve(), and global dependencies ' +
      'with Atomic.resolve()');
  }
  
  window.setTimeout(function() {
    deferred.resolve(resolved);
  }, 10);
  
  return deferred.promise;
};
