/*global window:true */

// atomic.js
(function(context, undefined) {
  /**
   * The global Atomic Object
   * @class Atomic
   */
  var Atomic = {};
  var oldAtomic = context.Atomic;
  var initialized = false;
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

  // compat/configurator.js
  /* @@ INSERT compat/configurator.js */

  // lib/fiber.js
  /* @@ INSERT lib/fiber.js */

  // atomic/abstractcomponent.js
  /* @@ INSERT atomic/abstractcomponent.js */

  // atomic/abstractbehavior.js
  /* @@ INSERT atomic/abstractbehavior.js */

  // assign locally included components to the Atomic namespace
  Atomic.Libs.Fiber = context.Fiber.noConflict();
  Atomic.AbstractComponent = AbstractComponent;
  Atomic.AbstractBehavior = AbstractBehavior;

  // assign public interface in window scope
  context.Atomic = Atomic;
})(this);
