/*global define:true, module:true */

// atomic.js
(function(context, undefined) {
  if (context.Atomic) {
    return;
  }

  /**
   * The global Atomic Object
   * @class Atomic
   */
  var Atomic = {};
  var oldAtomic = context.Atomic;
  var initialized = false;

  var AbstractElement = null;
  var AbstractBehavior = null;
  var CONSTANTS = null;

  var fiber = null;

  var module;
  var exports;
  var process;

  Atomic.Config = context.ATOMIC_CONFIG || {};
  Atomic.initConfig = function() {};
  Atomic.Libs = {};

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

  /**
   * prevent conflicts with an existing variable
   * if it is named "Atomic". Returns the current
   * Atomic reference
   * @method Atomic.noConflict
   * @return Object - the current Atomic reference
   */
  Atomic.noConflict = function () {
    var thisAtomic = context.Atomic;
    context.Atomic = oldAtomic;
    return thisAtomic;
  };

  /**
   * load the specified dependencies, then run the callback
   * with the dependencies as arguments. This abstracts
   * away any loader framework implementations
   * @method Atomic.load
   * @param Array depend - an array of dependencies
   * @param Function then - a callback to run with dependencies as arguments
   */
  Atomic.load = function(depend, then) {
    if (!initialized) {
      Atomic.initConfig();
      initialized = true;
    }

    // USE THE SPECIFIED LOADER's ASYNC INTERFACE
    // AND ON COMPLETION, RUN THE CALLBACK FUNCTION
    // WITH DEPENDENCIES ENUMERATED

  };

  // --------------------------------------------------
  // CONSTANTS
  // --------------------------------------------------
  // ./constants.js
  /* @@ INSERT constants.js */
  Atomic.CONSTANTS = CONSTANTS;

  // --------------------------------------------------
  // FIBER
  // --------------------------------------------------
  // lib/fiber.js
  /* @@ INSERT lib/fiber.js */
  Atomic.OOP = context.Fiber.noConflict();

  // --------------------------------------------------
  // EVENT EMITTER 2
  // --------------------------------------------------
  // lib/eventemitter2.js
  cjsHarness();
  /* @@ INSERT lib/eventemitter2.js */
  Atomic.CustomEvent = module.exports;
  resetCjs();

  // --------------------------------------------------
  // ABSTRACT ELEMENT
  // --------------------------------------------------
  // atomic/abstractcomponent.js
  /* @@ INSERT atomic/abstractcomponent.js */
  Atomic.AbstractElement = AbstractElement;

  // --------------------------------------------------
  // ABSTRACT BEHAVIOR
  // --------------------------------------------------
  // atomic/abstractbehavior.js
  /* @@ INSERT atomic/abstractbehavior.js */
  Atomic.AbstractBehavior = AbstractBehavior;

  // assign public interface in window scope
  context.Atomic = Atomic;
})(this);

if (define && define.amd) {
  define('atomic', this.Atomic);
}
if (module && module.exports) {
  module.exports = this.Atomic;
}