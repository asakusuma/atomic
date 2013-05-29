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

// atomic.js
(function(context, undefined) {
  if (context.Atomic) {
    return;
  }

  /**
   * The global Atomic Object
   * @class Atomic
   */
  var Atomic = {
    CONSTANTS: {},
    Events: {},
    _: {
      Fiber: null,
      EventEmitter: null,
      requires: {} // used when no module loader is enabled
    },
    loader: {
      init: null,
      load: null
    }
  };

  // common JS and AMD environment
  // inside of this file, no define calls can be made
  var module;
  var exports;
  var process;
  var define = null;

  // imported APIs
  var __Atomic_AbstractComponent__;
  var __Atomic_CONSTANTS__;
  var __Atomic_Public_API__;
  var __Atomic_Events_API__;
  var __Atomic_Public_Factory_Methods__;
  var __Atomic_Private_Factory_Methods__;

  Atomic.config = context.ATOMIC_CONFIG || {};

  /**
   * Copy one objects properties into another
   * @method Atomic.augment
   * @param {Object} src - the source to supplement with new things
   * @param {Object} target - the thing to copy from
   * @returns {Object} the resulting object. `src` is updated by reference when using objects
   * @private
   */
  Atomic.augment = function(src, target) {
    if (Object.prototype.toString.call(src) === '[object Array]') {
      src = src.concat(target);
    }
    else {
      for (var name in target) {
        if (target.hasOwnProperty(name)) {
          src[name] = target[name];
        }
      }
    }
    return src;
  };

  /**
   * Create a "CommonJS" environment. This lets us
   * include a library directly, without having to alter
   * the original code. We can then collect the contents
   * from the module.exports object
   * @method cjsHarness
   * @private
   */
  function cjsHarness() {
    module = {
      exports: {}
    };
    exports = module.exports;
    process = {
      title: 'Atomic CommonJS Harness'
    };
  }

  /**
   * Destroy the "CommonJS" environment.
   * @method resetCjs
   * @private
   */
  function resetCjs() {
    module = undefined;
    exports = undefined;
    process = undefined;
  }

  // --------------------------------------------------
  // CONSTANTS
  // --------------------------------------------------
  //@@include('./constants.js')
  Atomic.augment(Atomic._.CONSTANTS, __Atomic_CONSTANTS__);

  // --------------------------------------------------
  // FIBER
  // --------------------------------------------------
  cjsHarness();
  //@@include('./lib/fiber.js')
  Atomic._.Fiber = module.exports;
  resetCjs();

  // --------------------------------------------------
  // EVENT EMITTER 2
  // --------------------------------------------------
  cjsHarness();
  //@@include('./lib/eventemitter2.js')
  Atomic._.EventEmitter = module.exports.EventEmitter2;
  resetCjs();

  // --------------------------------------------------
  // WHEN.JS Promises/A+
  // --------------------------------------------------
  cjsHarness();
  //@@include('./lib/when.js')
  Atomic._.When = module.exports;
  resetCjs();

  // --------------------------------------------------
  // ABSTRACT COMPONENT
  // --------------------------------------------------
  //@@include('./atomic/abstractcomponent.js')
  Atomic._.AbstractComponent = __Atomic_AbstractComponent__;

  // --------------------------------------------------
  // FACTORY APIs
  // --------------------------------------------------
  //@@include('./atomic/factory.js')
  Atomic.augment(Atomic, __Atomic_Public_Factory_Methods__);
  Atomic.augment(Atomic._, __Atomic_Private_Factory_Methods__);

  // --------------------------------------------------
  // PUBLIC INTERFACES
  // --------------------------------------------------
  //@@include('./atomic/public.js')
  Atomic.augment(Atomic, __Atomic_Public_API__);

  //@@include('./atomic/events.js')
  Atomic.augment(Atomic.Events, __Atomic_Events_API__);

  // assign public interface in window scope
  context.Atomic = Atomic;
})(this);