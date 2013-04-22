/*global Atomic:true, context:true, Q:true */

/**
 * This file contains the public Atomic APIs. Anything
 * we wish to attach to Atomic.___ at a top level should
 * be exposed in this file.
 */

/**
 * A helper method to return the Q object. Aids in unit
 * testing the public functions
 */
function getQ() {
  return Q;
}

// holds the previous Atomic reference
var Atomic_noConflict_oldAtomic = context.Atomic;

// holds the initialized state of the framework
var Atomic_load_initialized = false;

Atomic.augment(Atomic, {
  /**
   * prevent conflicts with an existing variable
   * if it is named "Atomic". Returns the current
   * Atomic reference
   * @method Atomic.noConflict
   * @return Object - the current Atomic reference
   */
  noConflict: function () {
    var thisAtomic = context.Atomic;
    context.Atomic = Atomic_noConflict_oldAtomic;
    return thisAtomic;
  },

  /**
   * load the specified dependencies, then run the callback
   * with the dependencies as arguments. This abstracts
   * away any loader framework implementations
   * @method Atomic.load
   * @param Array depend - an array of dependencies
   * @param Function then - a callback to run with dependencies as arguments
   */
  load: function(depend, then) {
    var result = null;
    if (!Atomic_load_initialized) {
      Q.when(Atomic.loader.init(), function() {
        Atomic_load_initialized = true;
        Q.when(Atomic.loader.load(depend), function(needs) {
          then.apply(context, needs);
        });
      });
    }
    else {
      Q.when(Atomic.loader.load(depend), function(needs) {
        then.apply(context, needs);
      });
    }
  },

  /**
   * A basic proxy function. Makes it easier to wrap functionality
   * @method Atomic.proxy
   * @param {Function} fn - the function to wrap
   * @param {Object} scope - the scope to apply fn within
   * @returns {Function}
   */
  proxy: function(fn, scope) {
    return function() {
      fn.apply(scope, arguments);
    };
  },

  /**
   * Get the keys of an object
   * @method Atomic.keys
   */
  keys: function(obj) {
    var name;
    var keys;
    for (name in obj) {
      if (obj.hasOwnProperty(name)) {
        keys[keys.length] = name;
      }
    }
    return keys;
  },

  /**
   * Creates the ability to call Promises from within the
   * wiring functions. This keeps us from having to pass
   * in control functions, instead making everything
   * synchronous by default. You may also pass it another
   * library's promise, which will convert to a Q promise
   * in the Atomic ecosystem.
   * @param {Object} promise - optional. a promise from another framework
   * @method Atomic.deferred
   * @returns Q.Defer
   */
  deferred: function(promise) {
    if (promise) {
      return getQ().when(promise);
    }
    else {
      return getQ().defer();
    }
  }
});