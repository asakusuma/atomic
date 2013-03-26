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

  // these prevent commonjs foolery
  var module = null;
  var exports = null;

  var AbstractElement = null;
  var AbstractBehavior = null;
  var CONSTANTS = null;

  var fiber = null;

  Atomic.Config = context.ATOMIC_CONFIG || {};
  Atomic.initConfig = function() {};
  Atomic.Libs = {};

  /**
   * prevent conflicts with an existing variable
   * if it is named "Atomic". Returns the current
   * Atomic reference
   * @method Atomic.noConflict
   * @return Object - the current Atomic reference
   */
  Atomic.noConflict = function () {};

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
  var oldAmd = null;
  var oldEE = context.EventEmitter;
  if (context.define && context.define.amd) {
    oldAmd = context.define.amd;
    context.define.amd = false;
  }
  /* @@ INSERT lib/eventemitter2.js */
  if (oldAmd) {
    context.define.amd = oldAmd;
  }
  Atomic.CustomEvent = context.EventEmitter;
  context.EventEmitter = oldEE;

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