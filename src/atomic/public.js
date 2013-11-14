/*global Atomic:true, context:true */
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

/**
 * This file contains the public Atomic APIs. Anything
 * we wish to attach to Atomic.___ at a top level should
 * be exposed in this file.
 */

/**
 * A helper method to return the When object. Aids in unit
 * testing the public functions
 * @method Atomic.getWhen
 * @private
 * @returns {Object} the When.js interface
 */
function getWhen() {
  return Atomic._.When;
}

/**
 * A helper method to test if the supplied object is an array
 * @method Atomic.isArray
 * @private
 * @returns {Boolean}
 */
function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

// holds the previous Atomic reference
var Atomic_noConflict_oldAtomic = context.Atomic;

// holds the initialized state of the framework
var Atomic_load_initialized = false;

// holds the config for if Atomic is AMD optimized
var Atomic_amd_optimized = false;

var __Atomic_Public_API__ = {
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
   * Set the pre-optimized flag for Atomic. If you have
   * used an AMD optimizer before running Atomic, you
   * should use this, as all your modules are going to
   * be properly named.
   */
  amdOptimized: function() {
    Atomic_amd_optimized = true;
  },

  /**
   * load the specified dependencies, then run the callback
   * with the dependencies as arguments. This abstracts
   * away any loader framework implementations
   * @method Atomic.load
   * @param Array depend - an array of dependencies or a list of dependencies
   * @param Function then - a callback to run with dependencies as arguments
   */
  load: function() {
    var deferred = Atomic.deferred();
    var args = [].slice.call(arguments, 0);

    // wrap the callback if it exists
    if (typeof args[args.length - 1] === 'function') {
      deferred.promise.then(args[args.length - 1]);
      args.pop();
    }

    // if 2+ args, no need to expand further
    if (args.length === 1) {
      args = args[0];
    }

    if (!isArray(args)) {
      args = [args];
    }

    // if not initialized, init, and then do the load step
    var initPromise = null;
    if (Atomic_load_initialized) {
      initPromise = Atomic.when(true);
    }
    else {
      // as part of init, save atomic/component and atomic into the loader system
      Atomic_load_initialized = true;
      initPromise = Atomic.when(Atomic.loader.init());
      initPromise.then(function() {
        Atomic.loader.register('Atomic', Atomic);
        Atomic.loader.register('Atomic/Component', Atomic.Component);
      });
    }

    // when initialization is complete, then call load
    // on load, resolve the primary promise
    initPromise
    .then(function() {
      return Atomic.when(Atomic.loader.load(args));
    })
    .then(function(needs) {
      return deferred.resolve(needs);
    }, function(reason) {
      return deferred.reject(reason);
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
      return fn.apply(scope, arguments);
    };
  },

  /**
   * Throttle a function. Prevents a function from running again within X seconds
   * this is really helpful for repeating key events, scrolling, or simply "noisy"
   * events
   * Visually, this can be interpreted as
   * XXXXXXXXXXXX      XXXXXXXXXXXX
   * I   I   I         I   I   I
   *
   * X = method called
   * I = actual invocation
   * 
   * From https://github.com/documentcloud/underscore/blob/master/underscore.js
   * @method Atomic.throttle
   * @param {Function} func - the function to throttle
   * @param {Number} wait - a number of milliseconds to wait
   * @param {Boolean} immediate - run a trailing function when throttled
   */
  throttle: function(func, wait, immediate) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    var later = function() {
      previous = new Date();
      timeout = null;
      result = func.apply(context, args);
    };
    return function() {
      var now = new Date();
      if (!previous && immediate === false) {
        previous = now;
      }
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
      } else if (!timeout) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  },

  /**
   * Debounces a function, by only letting it run after the user has taken
   * no activity for X seconds. Similar to throttle, this is more useful
   * when you want to limit the invocations to once for every burst of
   * activity
   *
   * Visually, this can be interpreted as (immediate=true)
   * XXXXXXXXXXXX      XXXXXXXXXXXX
   * I                 I
   *
   * alternatively, this can be interpreted as (immediate=false)
   * XXXXXXXXXXXX      XXXXXXXXXXXX
   *                I                 I
   *
   * X = method called
   * I = actual invocation
   *
   * Notice how the user needed to stop acting for a window in order
   * for the trigger to reset
   *
   * From https://github.com/documentcloud/underscore/blob/master/underscore.js
   * @method Atomic.debounce
   * @param {Function} func - the function to wrap for debouncing
   * @param {Number} wait - the number of milliseconds to wait until invoking
   * @param {Boolean} immediate - if true, the event is on the leading edge
   */
  debounce: function(func, wait, immediate) {
    var result;
    var timeout = null;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
        }
      };
      var callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
      }
      return result;
    };
  },

  /**
   * Take a function (which takes 1 arg) and return a function that takes
   * N args, where N is the length of the object or array in arguments[0]
   * @method Atomic.expand
   * @param {Function} fn - the function to expand
   * @returns {Function} a function that takes N args
   */
  expand: function(fn) {
    return function(args) {
      var key;
      var expanded = [];
      if (Object.prototype.toString.call(args) === '[object Array]') {
        expanded = args;
      }
      else {
        for (key in args) {
          if (args.hasOwnProperty(key)) {
            expanded.push(args[key]);
          }
        }
      }

      fn.apply(fn, expanded);
    };
  },

  /**
   * Get the keys of an object
   * @method Atomic.keys
   */
  keys: function(obj) {
    var name;
    var keys = [];
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
   * library's promise, which will convert to a promise
   * in the Atomic ecosystem.
   * @param {Object} promise - optional. a promise from another framework
   * @method Atomic.deferred
   * @returns {Object} Promise
   */
  deferred: function(promise) {
    if (promise) {
      return getWhen()(promise);
    }
    else {
      return getWhen().defer();
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
    
    getWhen()(whennable, function(resolveResult) {
      return deferred.resolve(resolveResult);
    }, function(rejectResult) {
      return deferred.reject(rejectResult);
    });

    return deferred.promise;
  },
  
  /**
   * Convert a collection of functions into a promise that runs in paralell
   * This is useful when loading a bunch of components inside of a control and
   * want to simply listen for when all of them are ready
   * @method Atomic.whenAll
   * @param {Array} the array of functions to convert to a single promise
   * @returns {Object} Promise
   */
  whenAll: function(whens) {
    var deferred = Atomic.deferred();
    var count = whens.length;
    var resultsObject = {};
    var rejectsObject = {};
    var resultsArray = [];
    var rejectsArray = [];
    var rejected = false;
    
    function resolved() {
      if (--count > 0) {
        return;
      }

      for (var i = 0, len = whens.length; i < len; i++) {
        if (resultsObject.hasOwnProperty('_' + i)) {
          resultsArray.push(resultsObject[i]);
          rejectsArray.push(null);
        }
        else if (rejectsObject.hasOwnProperty('_' + i)) {
          rejected = true;
          resultsArray.push(null);
          rejectsArray.push(rejectsObject[i]);
        }
      }
      
      if (rejected) {
        return deferred.reject(rejectsArray);
      }
      else {
        return deferred.resolve(resultsArray);
      }
    }
    
    function arrayWhen(idx, statement) {
      getWhen()(statement, function(resolveResult) {
        resultsObject['_' + idx] = resolveResult;
        resolved();
      }, function(rejectResult) {
        rejectsObject['_' + idx] = rejectResult;
        resolved();
      });
    }
    
    for (i = 0, len = whens.length; i < len; i++) {
      arrayWhen(i, whens[i]);
    }
    
    return deferred.promise;
  },
  
  /**
   * A synchronous version of whenAll
   * @see Atomic.whenAll
   */
  whenAllSync: function(whens) {
    var deferred = Atomic.deferred();
    var resultsArray = [];
    var rejectsArray = [];
    var tempWhens = whens;
    
    function promise(statement) {
      getWhen()(statement, function(resolveResult) {
        resultsArray.push(resolveResult);
        rejectsArray.push(null);
        var nextWhen = tempWhens.shift();
        
        if (!nextWhen) {
          return deferred.resolve(resultsArray);
        }
        else {
          promise(nextWhen);
        }
      }, function(rejectResult) {
        resultsArray.push(null);
        rejectsArray.push(rejectResult);
        
        return deferred.reject(rejectsArray);
      });
    }
    
    promise(tempWhens.shift());
    
    return deferred.promise;
  },

  /**
   * the Atomic thrower is a function you can use to handle rejection
   * of promises. It's easier than writing your own, and will output
   * to console.error as a last resort
   * @method Atomic.thrower
   * @param {Object} err - the error from a rejection
   */
  error: function(err) {
    /*global console:true */

    // if exception, try to get the stack
    var msg = '';
    var stack = '';

    if (typeof err === 'object') {
      if (err.message) {
        msg = err.message;
      }
      else if (err.toString) {
        msg = err.toString();
      }

      if (err.stack) {
        stack = err.stack;
      }
      else if (err.stacktrace) {
        stack = err.stacktrace;
      }
    }
    else if (typeof err === 'string') {
      msg = err;
    }

    if (console && console.error) {
      console.error(msg + '\n' + stack);
    }
  }
};
__Atomic_Public_API__.e = __Atomic_Public_API__.error;

__Atomic_Public_API__ = __Atomic_Public_API__;
