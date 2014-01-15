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

(function(Atomic, context) {
  // holds the previous Atomic reference
  var Atomic_noConflict_oldAtomic = context.Atomic;

  // holds the initialized state of the framework
  var Atomic_load_initialized = false;

  // holds the config for if Atomic is AMD optimized
  var Atomic_amd_optimized = false;

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
        return deferred.fulfill(needs);
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
      var lib = getPromiseLibrary();
      if (promise) {
        lib.cast(promise);
      }
      else {
        return lib.pending();
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
      return getPromiseLibrary().cast(whennable);
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
      return getPromiseLibrary().all(whens);
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
    },
    
    /**
     * Describe a component for the purpose of exploration or documentation
     * being able to see all the self-documenting code of Atomic Components is
     * a major feature. Using describe() will tell you about the component via
     * console.log if available, and return a promise with the JSON structure
     * @method Atomic.describe
     * @param {String} component - the component to get a description of
     * @param {Boolean} output - (optional) should the description be printed to the console
     */
    describe: function(component, output) {
      if (typeof output == 'undefined') {
        output = true;
      }
    
      var d = Atomic.deferred();
    
      function printComponent(Component) {
        var c = new Component();
        var strOut = [];
        var objOut = {};
        objOut.component = component;
        objOut.name = c.name;
        objOut.depends = c.depends._.raw();
        objOut.events = c.events._.raw();
        objOut.states = c.states._.raw();

        strOut = [
          component + ': ' + c.name,
          '=====',
          'BEM id: ' + c.BEM(),
          'dependencies: ' + c.depends._.raw().join(', '),
          '',
          'ELEMENTS',
          c.elements.toString(),
          '',
          'EVENTS',
          c.events.toString(),
          '',
          'STATES',
          c.states.toString()
        ];
      
        if (output && context.console && typeof context.console.log == 'function') {
          context.console.log(strOut.join('\n'));
        }
      
        d.fulfill(objOut);
      }
    
      if (typeof component === 'string') {
        Atomic.load([component])
        .then(Atomic.expand(function(Component) {
          printComponent(Component);
        }, Atomic.e))
        .then(null, Atomic.e);
      }
      else if (typeof component === 'function') {
        var c = new component();
        printComponent(c);
      }
      else {
        printComponent(component);
      }
    
      return d.promise;
    },
    
    /**
     * Shims the global define when an AMD loader doesn't exist
     * very useful when running unit tests, so you are not tied to a loader's structure
     * @method Atomic.define
     * @param {String} id - the ID of the module
     * @param {Array} depends - the dependencies array
     * @param {Function} factory - the factory function that contains exports
     */
    define: function(id, depends, factory) {
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
    }
  });
}(Atomic, context));
