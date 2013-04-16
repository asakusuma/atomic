/*global Atomic:true, context:true, Q:true */

/**
 * prevent conflicts with an existing variable
 * if it is named "Atomic". Returns the current
 * Atomic reference
 * @method Atomic.noConflict
 * @return Object - the current Atomic reference
 */
var Atomic_noConflict_oldAtomic = context.Atomic;
Atomic.noConflict = function () {
  var thisAtomic = context.Atomic;
  context.Atomic = Atomic_noConflict_oldAtomic;
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
var Atomic_load_initialized = false;
Atomic.load = function(depend, then) {
  if (!Atomic_load_initialized) {
    Atomic.initConfig();
    Atomic_load_initialized = true;
  }

  // USE THE SPECIFIED LOADER's ASYNC INTERFACE
  // AND ON COMPLETION, RUN THE CALLBACK FUNCTION
  // WITH DEPENDENCIES ENUMERATED

};

/**
 * A basic proxy function. Makes it easier to wrap functionality
 * @method Atomic.proxy
 * @param {Function} fn - the function to wrap
 * @param {Object} scope - the scope to apply fn within
 * @returns {Function}
 */
Atomic.proxy = function(fn, scope) {
  return function() {
    fn.apply(scope, arguments);
  };
};

/**
 * Creates the ability to call Promises from within the
 * wiring functions. This keeps us from having to pass
 * in control functions, instead making everything
 * synchronous by default. You may also pass it another
 * library's promise, which will convert to a Q promise
 * in the Atomic ecosystem.
 * @param {Object} promise - optional. a promise from another framework
 * @method Atomic.promise
 * @returns Q.Defer
 */
Atomic.promise = function(promise) {
  if (promise) {
    return Q.when(promise);
  }
  else {
    return Q.defer();
  }
};