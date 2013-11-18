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
  var Atomic = function() {
    Atomic.define.apply(Atomic, arguments);
  };
  Atomic.CONSTANTS = {};
  Atomic.Events = {};
  Atomic._ = {
    Fiber: null,
    EventEmitter: null,
    requires: {}, // used when no module loader is enabled
    modules: {}
  };
  Atomic.loader = {
    init: function() {},
    register: function(id, exports) {
      Atomic._.modules[id] = exports;
    },
    load: function(deps) {
      var resolved = [];
      for (var i = 0, len = deps.length; i < len; i++) {
        if (!Atomic._.modules[deps[i]]) {
          throw new Error('Module ID is not defined: ' + deps[i]);
        }
        resolved.push(Atomic._.modules[deps[i]]);
      }
      return resolved;
    }
  };

  // common JS and AMD environment
  // inside of this file, no define calls can be made
  var module;
  var exports;
  var process;
  var require = null;
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
   * Shims the global define when an AMD loader doesn't exist
   * very useful when running unit tests, so you are not tied to a loader's structure
   * @method Atomic.define
   * @param {String} id - the ID of the module
   * @param {Array} depends - the dependencies array
   * @param {Function} factory - the factory function that contains exports
   */
  Atomic.define = function(id, depends, factory) {
    if (typeof id !== 'string') {
      throw new Error('you must specify an ID if you are not using a module loader system');
    }
    if (Object.prototype.toString.call(depends) !== '[object Array]') {
      factory = depends;
      depends = [];
    }
    
    // a local require
    var require = function(str) {
      if (window.console && window.console.warn) {
        window.console.warn('using runtime require() is dangerous without a module loader');
      }
      if (!Atomic._.modules[str]) {
        throw new Error('Module not loaded: ' + str);
      }
      return Atomic._.modules[str];
    };
    
    var module = {
      exports: {}
    };
    
    var resolved = [];
    var result;
    for (var i = 0, len = depends.length; i < len; i++) {
      if (depends[i] === 'require') {
        resolved.push(require);
        continue;
      }
      if (depends[i] === 'module') {
        resolved.push(module);
        continue;
      }
      if (depends[i] === 'exports') {
        resolved.push(module.exports);
        continue;
      }
      if (!Atomic._.modules[depends[i]]) {
        throw new Error('Module not loaded: ' + depends[i]);
      }
      resolved.push(Atomic._.modules[depends[i]]);
    }
    
    if (typeof factory === 'function') {
      result = factory.apply(factory, resolved);
      if (result) {
        Atomic._.modules[id] = result;
      }
      else {
        Atomic._.modules[id] = module.exports;
      }
    }
    else {
      Atomic._.modules[id] = factory;
    }
    
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
    require = undefined;
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
  // from external library
  //@@include('../tmp/lib/fiber/fiber.js')
  Atomic._.Fiber = module.exports;
  resetCjs();

  // --------------------------------------------------
  // EVENT EMITTER 2
  // --------------------------------------------------
  cjsHarness();
  // from external library
  //@@include('../tmp/lib/eventemitter2/eventemitter2.js')
  Atomic._.EventEmitter = module.exports.EventEmitter2;
  resetCjs();

  // --------------------------------------------------
  // WHEN.JS Promises/A+
  // --------------------------------------------------
  cjsHarness();
  // from external library
  //@@include('../tmp/lib/bluebird/js/browser/bluebird.js')
  Atomic._.Bluebird = module.exports;
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

  // assign atomic version
  //@@include('./atomic/version.js')

  // assign public interface in window scope
  context.Atomic = Atomic;
  
  // assign all the pieces to modules
  var defineCall = (typeof define == 'function' && define.amd) ? define : Atomic;
  defineCall('Atomic', [], function() { return Atomic; });
  defineCall('Atomic/Component', [], function() { return Atomic.Component; });
  defineCall('Atomic/Wiring', [], function() { return Atomic.Wiring; });
})(this);