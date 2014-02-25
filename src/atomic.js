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
(function(context, getDefine, undefined) {
  if (context.Atomic) {
    return;
  }

  // common JS and AMD environment
  // inside of this file, no define calls can be made
  var module;
  var exports;
  var process;
  var require = null;
  var define = null;
  var globalDefine = null;
  
  try {
    globalDefine = getDefine();
  }
  catch(e) {}

  /**
   * The global Atomic Object
   * @class Atomic
   */
  var Atomic = function() {
    Atomic.define.apply(Atomic, arguments);
  };
  
  /**
   * Create a "CommonJS" environment. This lets us
   * include a library directly, without having to alter
   * the original code. We can then collect the contents
   * from the module.exports object
   * @method cjsHarness
   * @private
   */
  function cjsHarness(fn) {
    var module = {
      exports: {}
    };
    var exports = module.exports;
    var process = {
      title: 'Atomic CommonJS Harness'
    };
    fn.call(module, module, exports, process);
  }
  
  Atomic.Events = {};
  Atomic._ = {
    Fiber: null,
    EventEmitter: null,
    requires: {}, // used when no module loader is enabled
    modules: {}
  };
  Atomic.config = context.ATOMIC_CONFIG || {};

  // assign public interface in window scope
  context.Atomic = Atomic;

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

  // --------------------------------------------------
  // CONSTANTS and GLOBALS
  // --------------------------------------------------
  //@@include('./includes/constants.js')
  //@@include('./includes/globals.js')

  // --------------------------------------------------
  // EXTERNAL LIBRARIES (using harnesses)
  // --------------------------------------------------
  cjsHarness(function(module, exports, process) {
    //@@include('../tmp/lib/fiber/fiber.js')
    Atomic._.Fiber = module.exports;
  });
  
  cjsHarness(function(module, exports, process) {
    //@@include('../tmp/lib/eventemitter2/eventemitter2.js')
    Atomic._.EventEmitter = module.exports.EventEmitter2;    
  });

  cjsHarness(function(module, exports, process) {
    //@@include('../tmp/lib/bluebird/bluebird.js')
    Atomic._.Bluebird = module.exports;
  });

  cjsHarness(function(module, exports, process) {
    //@@include('../tmp/lib/semver/semver.js')
    Atomic._.SemVer = module.exports;
  });

  // --------------------------------------------------
  // CLASSES
  // --------------------------------------------------
  //@@include('./classes/abstractcomponent.js')
  
  // --------------------------------------------------
  // MODULES
  // --------------------------------------------------
  //@@include('./modules/events.js')
  //@@include('./modules/factory.js')
  //@@include('./modules/loader.js')
  //@@include('./modules/public.js')
  //@@include('./modules/version.js')

  // assign all the pieces to modules
  var defineCall = (typeof globalDefine == 'function' && globalDefine.amd) ? globalDefine : Atomic;
  defineCall('Atomic', [], function() { return Atomic; });
  defineCall('Atomic/Component', [], function() { return Atomic.Component; });
  defineCall('Atomic/Wiring', [], function() { return Atomic.Wiring; });
})(this, function() { return define; });
