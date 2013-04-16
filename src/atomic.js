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
  var Atomic = {
    _: {}
  };

  var AbstractComponent = null;
  var CONSTANTS = null;

  var fiber = null;

  var module;
  var exports;
  var process;

  Atomic.config = context.ATOMIC_CONFIG || {};
  Atomic.initConfig = function() {};

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
  Atomic._.CONSTANTS = CONSTANTS;

  // --------------------------------------------------
  // FIBER
  // --------------------------------------------------
  //@@include('./lib/fiber.js')
  Atomic._.Fiber = context.Fiber.noConflict();

  // --------------------------------------------------
  // EVENT EMITTER 2
  // --------------------------------------------------
  cjsHarness();
  //@@include('./lib/eventemitter2.js')
  Atomic._.EventEmitter = module.exports;
  resetCjs();

  // --------------------------------------------------
  // Q
  // --------------------------------------------------
  cjsHarness();
  //@@include('./lib/q.js')
  Atomic._.Q = module.exports;
  resetCjs();

  // --------------------------------------------------
  // ABSTRACT COMPONENT
  // --------------------------------------------------
  //@@include('./atomic/abstractcomponent.js')
  Atomic._.AbstractComponent = AbstractComponent;

  // --------------------------------------------------
  // FACTORIES
  // --------------------------------------------------
  //@@include('./atomic/component.js')
  //@@include('./atomic/composite.js')

  // --------------------------------------------------
  // PUBLIC INTERFACE
  // --------------------------------------------------
  //@@include('./atomic/public.js')

  // assign public interface in window scope
  context.Atomic = Atomic;
})(this);

if (define && define.amd) {
  define('atomic', this.Atomic);
}
if (module && module.exports) {
  module.exports = this.Atomic;
}