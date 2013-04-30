/*global Atomic:true, context:true */

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
  return Atomic._.Q;
}

// holds the previous Atomic reference
var Atomic_noConflict_oldAtomic = context.Atomic;

// holds the initialized state of the framework
var Atomic_load_promise = null;

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
    var deferred = Atomic.deferred();

    // wrap the callback if it exists
    if (typeof then === 'function') {
      deferred.then(then);
    }

    // if not initialized, init, and then do the load step
    Atomic_load_promise = Atomic_load_promise || Atomic.when(Atomic.loader.init());

    // when initialization is complete, then call load
    // on load, resolve the primary promise
    Atomic_load_promise.then(function() {
      Atomic.when(Atomic.loader.load(depend))
      .then(function(needs) {
        return deferred.resolve(needs);
      });
    }, function(reason) {
      throw new Error('Unable to initialize: '+reason);
    });

    // return the promise
    return deferred.promise;
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
   * @returns {Object} Promise
   */
  deferred: function(promise) {
    if (promise) {
      return getQ().when(promise);
    }
    else {
      return getQ().defer();
    }
  },

  /**
   * Convert a function value or promise return into
   * a promise. Very useful when you don't know if the function
   * is going to return a promise. This way, it's always a
   * promise, all of the time
   * @method Atomic.when
   * @param {Function|Object} the item you want to convert to a promise
   * @returns {Object} Promise
   */
  when: function(whennable) {
    var deferred = Atomic.deferred();
    getQ().when.call(getQ(), whennable, function(resolveResult) {
      return deferred.resolve(resolveResult);
    }, function(rejectResult) {
      return deferred.reject(rejectResult);
    });
    return deferred.promise;
  },

  /**
   * Export a module for CommonJS or AMD loaders
   * @method Atomic.export
   * @param {Object} mod - commonJS module object
   * @param {Object} def - AMD define function
   * @param {Function} factory - the defining factory for module or exports
   */
  export: function(mod, def, factory) {
    if (mod && mod.exports) {
      mod.exports = factory();
    }
    else if (def && def.amd) {
      def(factory.id, factory);
    }
    else if (Atomic.loader && Atomic.loader.save) {
      Atomic.loader.save(factory.id, factory());
    }
    else {
      window[factory.id] = factory();
    }

    if (factory.window && window) {
      window[factory.window] = factory();
    }
  }
});