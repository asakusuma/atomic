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

/*
================================================================================
ABOUT THIS FILE - amd shim https://gist.github.com/Jakobo/6894733
================================================================================
This file is a helper shim for pure AMD modules. When writing an AMD module,
you need to have access to a global "define" method. This creates a global
define(), a global require(), and a global AMD object.
 
define/require work like proper sinon stubs. Any define() calls that happen
before your test are automatically queued to run. You can then stub out
define() to respond how you need it to, including expectations.
 
AMD.run() allows you to "unpause" your loader, running through your
define() statements as if you are doing them for the first time; this time
with sinon stubs.
 
AMD.exports is an array [] containing the exports. It's sequentially
written to for every define() call made.
*/

var AMD = {};
var define;
var require;
(function() {
  
  var exports = [];
  var queue = [];
  var oldDefine = define;
  var oldRequire = require;
  
  // replace the global define if it exists with a generic buffer
  define = function() {
    queue.push([].slice.call(arguments, 0));
  };
  define.amd = true;
  
  var resolveDefineCall = function(args) {
    var resolved = null;
    var factory = null;
    
    // swap the "factory" object if it is a function with an interceptor
    // this saves all the "resolved" variables transparently to the end
    // user
    factory = args.pop();
    if (typeof factory == 'function') {
      args.push(function() {
        resolved = [].slice.call(arguments, 0);
      });
    }
    
    // through sinon we go!
    define.apply(define, args);
    
    // if the factory was a function, run it with our resolved things
    // otherwise, return the object literal
    if (typeof factory == 'function') {
      exports.push(factory.apply(factory, resolved));
    }
    else {
      exports.push(factory);
    }
  };
  
  // initializes a sinon version of the AMD environment
  AMD.init = function(stubber) {
    if (!stubber && !sinon) {
      throw new Error('AMD Shim requires at least some mock generator. We recommend sinon.js');
    }
    if (!stubber) {
      stubber = sinon.stub;
    }
    define = stubber();
    require = stubber();
    AMD.ready = true;
  };
  
  // tun through all our define() statements now that we've stubbed them out
  // exports end up in AMD.exports
  AMD.run = function() {
    if (!AMD.ready) {
      throw new Error('You must call AMD.init() to stub define and require first');
    }

    // empty the buffer, and shove each item through sinon.js
    // a while loop ensures more define() goes through sinon
    var args = queue.shift();
    while (args) {
      resolveDefineCall(args);
      args = queue.shift();
    }
  };
  
  AMD.restore = function() {
    AMD.ready = false;
    define = oldDefine;
    require = oldRequire;
  };
  
  // all exports from define()d items
  AMD.exports = exports;
}(typeof sinon != 'undefined'));

Atomic.version = 'TEST-' + Atomic.version;
Atomic.Test = {};
Atomic.Test.methods = {};
Atomic.Test.methods.Component = Atomic.Component;
Atomic.Test.methods.Load = Atomic.Load;

/**
 * Pre-resolve an outcome for Atomic.load()
 * useful for testing your page-level JavaScript, where you want to
 * call Atomic.load() with everything already set up for you
 * @method Atomic.Test.resolve()
 * @param {String} name - the name you would like to resolve
 * @param {Object} obj - the object you would like "name" to resovle to
 */
Atomic.Test.resolve = function(name, obj) {
  Atomic(name, [], function() { return obj; });
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
 * Replaces Atomic.load, and ensures you cannot call it while in testing
 * mode. This helps to make sure you are testing in isolation and that your
 * dependencies have been properly mocked.
 */
Atomic.load = function() {
  var deps = [].slice.call(arguments, 0);
  var resolved = [];
  var deferred = Atomic.deferred();

  for (var i = 0, len = deps.length; i < len; i++) {
    comp = Atomic._.modules[deps[i]];
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
