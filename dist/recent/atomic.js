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

  var INVALID_CLASS_CHARACTERS = /[^A-Z0-9\-\_]/gi;

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
   * A helper method to return the promises library object. Aids in unit
   * testing the public functions
   * @method Atomic.getPromiseLibrary
   * @private
   * @returns {Object} the promise library
   */
  function getPromiseLibrary() {
    return Atomic._.Bluebird;
  }

  /**
   * Tests if an element has a class
   * @method AbstractComponent.hasClass
   * @private
   * @param {HTMLElement} el - an html element
   * @param {String} klass - a class name to test for
   * @returns {Boolean}
   */
  function hasClass(el, klass) {
    return el.className.match(new RegExp('(?:^|\\s)' + klass.replace(/[^A-Z0-9\-\_]/gi, '-') + '(?!\\S)'));
  }

  /**
   * Test if the provided object is an array
   * @method AbstractComponent.isArray
   * @private
   * @param {Object} obj - the object to test
   * @returns {Boolean} if true, the object is an array
   */
  function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  /**
   * Creates a "displayable" version of an object or array.
   * On instantiation of an AbstractComponent, this is what
   * converts the elements/depends/events into their final
   * resolved forms.
   * An object returned by createDisplayable has the following
   * methods available to it:
   *
   * () - called as a function with no arguments, the resolved
   *   version of the object is provided. This is all of the
   *   assignments that have been made.
   * (key) - called as a function with one argument, the resolved
   *   value for a specific key is provided. This is the same as
   *   calling ().key
   * (key, value) - assigns a resolved "value" to a key
   * .toString() - the string interface for this object provides
   *   the original structure in an easy to read format. It also
   *   indicates which objects have been resolved and have values
   *   assigned to them. This is primarily a debugging tool.
   * ._ - a collection of internal methods for the interface,
   *   including add (adds new items to the collection), raw
       (returns the original object), and set (assigns a resolved
   *   value)
   *
   * @function createDisplayableObject
   * @private
   * @param {Object} obj - the object to convert
   * @param {Boolean} writeBack - if true, properties are also stored on the returned object
   * @param {Boolean} preResolved - if true, no resolution of the object is used. The keys become values
   * @returns {Object} a function/object combination wtih the above methods
   */
  function createDisplayableObject(obj, writeBack, preResolved) {
    var type = (isArray(obj)) ? 'array' : 'object';
    var values = {};
    var registry = {};
    var name, i, len;
    var iface = function(key, to) {
      if (key && to) {
        return iface._.set(key, to);
      }
      else if (key) {
        return values[key];
      }
      return values;
    };
    iface.toString = function() {
      var out = [];
      var name, i;
      if (type === 'object') {
        for (name in obj) {
          if (obj.hasOwnProperty(name)) {
            out.push(name + ' (' + (values[name] ? 'R' : '?') + '): ' + obj[name]);
          }
        }
      }
      else {
        for (i = 0, len = obj.length; i < len; i++) {
          out.push('[' + i + '] (' + (values[obj[i]] ? 'R' : '?') + '): ' + obj[i]);
        }
      }
      return out.join('\n');
    };
    iface._ = {
      raw: function() {
        return obj;
      },
      exists: function(key) {
        if (type === 'array') {
          for (var i = 0, len = obj.length; i < len; i++) {
            if (obj[i] === key) {
              return true;
            }
          }
          return false;
        }
        else {
          for (var name in obj) {
            if (obj.hasOwnProperty(name) && name === key) {
              return true;
            }
          }
          return false;
        }
      },
      add: function() {
        if (type === 'array') {
          if (!registry[arguments[0]]) {
            registry[arguments[0]] = 1;
            obj.push(arguments[0]);
            iface._.set(arguments[0], null);
          }
        }
        else {
          obj[arguments[0]] = arguments[1];
          if (writeBack) {
            iface[arguments[0]] = arguments[0];
          }
          if (preResolved) {
            values[arguments[0]] = arguments[0];
          }
        }
      },
      set: function(key, to) {
        values[key] = to;
      }
    };

    if (type === 'object') {
      for (name in obj) {
        if (obj.hasOwnProperty(name)) {
          iface._.set(name, null);
          if (writeBack) {
            iface[name] = name;
          }
          if (preResolved) {
            values[name] = name;
          }
        }
      }
    }
    else {
      for (i = 0, len = obj.length; i < len; i++) {
        iface._.set(obj[i], null);
      }
    }

    return iface;
  }

  // --------------------------------------------------
  // EXTERNAL LIBRARIES (using harnesses)
  // --------------------------------------------------
  cjsHarness(function(module, exports, process) {
    //     Fiber.js 1.0.4
    //     @Author: Kirollos Risk
    //
    //     Copyright (c) 2012 LinkedIn.
    //     All Rights Reserved. Apache Software License 2.0
    //     http://www.apache.org/licenses/LICENSE-2.0

    ( function( global ) {

      // Baseline setup
      // --------------

      // Stores whether the object is being initialized. i.e., whether
      // to run the `init` function, or not.
      var initializing = false,

      // Keep a few prototype references around - for speed access,
      // and saving bytes in the minified version.
        ArrayProto = Array.prototype,

      // Save the previous value of `Fiber`.
        previousFiber = global.Fiber;

      // Helper function to copy properties from one object to the other.
      function copy( from, to ) {
        var name;
        for( name in from ) {
          if( from.hasOwnProperty( name ) ) {
            to[name] = from[name];
          }
        }
      }

      // The base `Fiber` implementation.
      function Fiber(){};

      // ###Extend
      //
      // Returns a subclass.
      Fiber.extend = function( fn ) {
        // Keep a reference to the current prototye.
        var parent = this.prototype,

        // Invoke the function which will return an object literal used to define
        // the prototype. Additionally, pass in the parent prototype, which will
        // allow instances to use it.
          properties = fn( parent ),

        // Stores the constructor's prototype.
          proto;

        // The constructor function for a subclass.
        function child(){
          if( !initializing ){
            // Custom initialization is done in the `init` method.
            this.init.apply( this, arguments );
            // Prevent susbsequent calls to `init`.
            // Note: although a `delete this.init` would remove the `init` function from the instance,
            // it would still exist in its super class' prototype.  Therefore, explicitly set
            // `init` to `void 0` to obtain the `undefined` primitive value (in case the global's `undefined`
            // property has been re-assigned).
            this.init = void 0;
          }
        }

        // Instantiate a base class (but only create the instance, without running `init`).
        // and make every `constructor` instance an instance of `this` and of `constructor`.
        initializing = true;
        proto = child.prototype = new this;
        initializing = false;

        // Add default `init` function, which a class may override; it should call the
        // super class' `init` function (if it exists);
        proto.init = function(){
          if ( typeof parent.init === 'function' ) {
            parent.init.apply( this, arguments );
          }
        };

         // Copy the properties over onto the new prototype.
        copy( properties, proto );

        // Enforce the constructor to be what we expect.
        proto.constructor = child;

        // Keep a reference to the parent prototype.
        // (Note: currently used by decorators and mixins, so that the parent can be inferred).
        child.__base__ = parent;

         // Make this class extendable.
        child.extend = Fiber.extend;

        return child;
      };

      // Utilities
      // ---------

      // ###Proxy
      //
      // Returns a proxy object for accessing base methods with a given context.
      //
      // - `base`: the instance' parent class prototype.
      // - `instance`: a Fiber class instance.
      //
      // Overloads:
      //
      // - `Fiber.proxy( instance )`
      // - `Fiber.proxy( base, instance )`
      //
      Fiber.proxy = function( base, instance ) {
        var name,
          iface = {},
          wrap;

        // If there's only 1 argument specified, then it is the instance,
        // thus infer `base` from its constructor.
        if ( arguments.length === 1 ) {
          instance = base;
          base = instance.constructor.__base__;
        }

        // Returns a function which calls another function with `instance` as
        // the context.
        wrap = function( fn ) {
          return function() {
            return base[fn].apply( instance, arguments );
          };
        };

        // For each function in `base`, create a wrapped version.
        for( name in base ){
          if( base.hasOwnProperty( name ) && typeof base[name] === 'function' ){
            iface[name] = wrap( name );
          }
        }
        return iface;
      };

      // ###Decorate
      //
      // Decorate an instance with given decorator(s).
      //
      // - `instance`: a Fiber class instance.
      // - `decorator[s]`: the argument list of decorator functions.
      //
      // Note: when a decorator is executed, the argument passed in is the super class' prototype,
      // and the context (i.e. the `this` binding) is the instance.
      //
      //  *Example usage:*
      //
      //     function Decorator( base ) {
      //       // this === obj
      //       return {
      //         greet: function() {
      //           console.log('hi!');
      //         }
      //       };
      //     }
      //
      //     var obj = new Bar(); // Some instance of a Fiber class
      //     Fiber.decorate(obj, Decorator);
      //     obj.greet(); // hi!
      //
      Fiber.decorate = function( instance /*, decorator[s] */) {
        var i,
          // Get the base prototype.
          base = instance.constructor.__base__,
          // Get all the decorators in the arguments.
          decorators = ArrayProto.slice.call( arguments, 1 ),
          len = decorators.length;

        for( i = 0; i < len; i++ ){
          copy( decorators[i].call( instance, base ), instance );
        }
      };

      // ###Mixin
      //
      // Add functionality to a Fiber definition
      //
      // - `definition`: a Fiber class definition.
      // - `mixin[s]`: the argument list of mixins.
      //
      // Note: when a mixing is executed, the argument passed in is the super class' prototype
      // (i.e., the base)
      //
      // Overloads:
      //
      // - `Fiber.mixin( definition, mix_1 )`
      // - `Fiber.mixin( definition, mix_1, ..., mix_n )`
      //
      // *Example usage:*
      //
      //     var Definition = Fiber.extend(function(base) {
      //       return {
      //         method1: function(){}
      //       }
      //     });
      //
      //     function Mixin(base) {
      //       return {
      //         method2: function(){}
      //       }
      //     }
      //
      //     Fiber.mixin(Definition, Mixin);
      //     var obj = new Definition();
      //     obj.method2();
      //
      Fiber.mixin = function( definition /*, mixin[s] */ ) {
        var i,
          // Get the base prototype.
          base = definition.__base__,
          // Get all the mixins in the arguments.
          mixins = ArrayProto.slice.call( arguments, 1 ),
          len = mixins.length;

        for( i = 0; i < len; i++ ){
          copy( mixins[i]( base ), definition.prototype );
        }
      };

      // ###noConflict
      //
      // Run Fiber.js in *noConflict* mode, returning the `fiber` variable to its
      // previous owner. Returns a reference to the Fiber object.
      Fiber.noConflict = function() {
        global.Fiber = previousFiber;
        return Fiber;
      };

      // Common JS
      // --------------

      // Export `Fiber` to Common JS Loader
      if( typeof module !== 'undefined' ) {
        if( typeof module.setExports === 'function' ) {
          module.setExports( Fiber );
        } else if( module.exports ) {
          module.exports = Fiber;
        }
      } else {
        global.Fiber = Fiber;
      }

    // Establish the root object: `window` in the browser, or global on the server.
    })( this );

    Atomic._.Fiber = module.exports;
  });
  
  cjsHarness(function(module, exports, process) {
    ;!function(exports, undefined) {

      var isArray = Array.isArray ? Array.isArray : function _isArray(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]";
      };
      var defaultMaxListeners = 10;

      function init() {
        this._events = {};
        if (this._conf) {
          configure.call(this, this._conf);
        }
      }

      function configure(conf) {
        if (conf) {

          this._conf = conf;

          conf.delimiter && (this.delimiter = conf.delimiter);
          conf.maxListeners && (this._events.maxListeners = conf.maxListeners);
          conf.wildcard && (this.wildcard = conf.wildcard);
          conf.newListener && (this.newListener = conf.newListener);

          if (this.wildcard) {
            this.listenerTree = {};
          }
        }
      }

      function EventEmitter(conf) {
        this._events = {};
        this.newListener = false;
        configure.call(this, conf);
      }

      //
      // Attention, function return type now is array, always !
      // It has zero elements if no any matches found and one or more
      // elements (leafs) if there are matches
      //
      function searchListenerTree(handlers, type, tree, i) {
        if (!tree) {
          return [];
        }
        var listeners=[], leaf, len, branch, xTree, xxTree, isolatedBranch, endReached,
            typeLength = type.length, currentType = type[i], nextType = type[i+1];
        if (i === typeLength && tree._listeners) {
          //
          // If at the end of the event(s) list and the tree has listeners
          // invoke those listeners.
          //
          if (typeof tree._listeners === 'function') {
            handlers && handlers.push(tree._listeners);
            return [tree];
          } else {
            for (leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
              handlers && handlers.push(tree._listeners[leaf]);
            }
            return [tree];
          }
        }

        if ((currentType === '*' || currentType === '**') || tree[currentType]) {
          //
          // If the event emitted is '*' at this part
          // or there is a concrete match at this patch
          //
          if (currentType === '*') {
            for (branch in tree) {
              if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
                listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+1));
              }
            }
            return listeners;
          } else if(currentType === '**') {
            endReached = (i+1 === typeLength || (i+2 === typeLength && nextType === '*'));
            if(endReached && tree._listeners) {
              // The next element has a _listeners, add it to the handlers.
              listeners = listeners.concat(searchListenerTree(handlers, type, tree, typeLength));
            }

            for (branch in tree) {
              if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
                if(branch === '*' || branch === '**') {
                  if(tree[branch]._listeners && !endReached) {
                    listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], typeLength));
                  }
                  listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
                } else if(branch === nextType) {
                  listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i+2));
                } else {
                  // No match on this one, shift into the tree but not in the type array.
                  listeners = listeners.concat(searchListenerTree(handlers, type, tree[branch], i));
                }
              }
            }
            return listeners;
          }

          listeners = listeners.concat(searchListenerTree(handlers, type, tree[currentType], i+1));
        }

        xTree = tree['*'];
        if (xTree) {
          //
          // If the listener tree will allow any match for this part,
          // then recursively explore all branches of the tree
          //
          searchListenerTree(handlers, type, xTree, i+1);
        }

        xxTree = tree['**'];
        if(xxTree) {
          if(i < typeLength) {
            if(xxTree._listeners) {
              // If we have a listener on a '**', it will catch all, so add its handler.
              searchListenerTree(handlers, type, xxTree, typeLength);
            }

            // Build arrays of matching next branches and others.
            for(branch in xxTree) {
              if(branch !== '_listeners' && xxTree.hasOwnProperty(branch)) {
                if(branch === nextType) {
                  // We know the next element will match, so jump twice.
                  searchListenerTree(handlers, type, xxTree[branch], i+2);
                } else if(branch === currentType) {
                  // Current node matches, move into the tree.
                  searchListenerTree(handlers, type, xxTree[branch], i+1);
                } else {
                  isolatedBranch = {};
                  isolatedBranch[branch] = xxTree[branch];
                  searchListenerTree(handlers, type, { '**': isolatedBranch }, i+1);
                }
              }
            }
          } else if(xxTree._listeners) {
            // We have reached the end and still on a '**'
            searchListenerTree(handlers, type, xxTree, typeLength);
          } else if(xxTree['*'] && xxTree['*']._listeners) {
            searchListenerTree(handlers, type, xxTree['*'], typeLength);
          }
        }

        return listeners;
      }

      function growListenerTree(type, listener) {

        type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

        //
        // Looks for two consecutive '**', if so, don't add the event at all.
        //
        for(var i = 0, len = type.length; i+1 < len; i++) {
          if(type[i] === '**' && type[i+1] === '**') {
            return;
          }
        }

        var tree = this.listenerTree;
        var name = type.shift();

        while (name) {

          if (!tree[name]) {
            tree[name] = {};
          }

          tree = tree[name];

          if (type.length === 0) {

            if (!tree._listeners) {
              tree._listeners = listener;
            }
            else if(typeof tree._listeners === 'function') {
              tree._listeners = [tree._listeners, listener];
            }
            else if (isArray(tree._listeners)) {

              tree._listeners.push(listener);

              if (!tree._listeners.warned) {

                var m = defaultMaxListeners;

                if (typeof this._events.maxListeners !== 'undefined') {
                  m = this._events.maxListeners;
                }

                if (m > 0 && tree._listeners.length > m) {

                  tree._listeners.warned = true;
                  console.error('(node) warning: possible EventEmitter memory ' +
                                'leak detected. %d listeners added. ' +
                                'Use emitter.setMaxListeners() to increase limit.',
                                tree._listeners.length);
                  console.trace();
                }
              }
            }
            return true;
          }
          name = type.shift();
        }
        return true;
      }

      // By default EventEmitters will print a warning if more than
      // 10 listeners are added to it. This is a useful default which
      // helps finding memory leaks.
      //
      // Obviously not all Emitters should be limited to 10. This function allows
      // that to be increased. Set to zero for unlimited.

      EventEmitter.prototype.delimiter = '.';

      EventEmitter.prototype.setMaxListeners = function(n) {
        this._events || init.call(this);
        this._events.maxListeners = n;
        if (!this._conf) this._conf = {};
        this._conf.maxListeners = n;
      };

      EventEmitter.prototype.event = '';

      EventEmitter.prototype.once = function(event, fn) {
        this.many(event, 1, fn);
        return this;
      };

      EventEmitter.prototype.many = function(event, ttl, fn) {
        var self = this;

        if (typeof fn !== 'function') {
          throw new Error('many only accepts instances of Function');
        }

        function listener() {
          if (--ttl === 0) {
            self.off(event, listener);
          }
          fn.apply(this, arguments);
        }

        listener._origin = fn;

        this.on(event, listener);

        return self;
      };

      EventEmitter.prototype.emit = function() {

        this._events || init.call(this);

        var type = arguments[0];

        if (type === 'newListener' && !this.newListener) {
          if (!this._events.newListener) { return false; }
        }

        // Loop through the *_all* functions and invoke them.
        if (this._all) {
          var l = arguments.length;
          var args = new Array(l - 1);
          for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
          for (i = 0, l = this._all.length; i < l; i++) {
            this.event = type;
            this._all[i].apply(this, args);
          }
        }

        // If there is no 'error' event listener then throw.
        if (type === 'error') {

          if (!this._all &&
            !this._events.error &&
            !(this.wildcard && this.listenerTree.error)) {

            if (arguments[1] instanceof Error) {
              throw arguments[1]; // Unhandled 'error' event
            } else {
              throw new Error("Uncaught, unspecified 'error' event.");
            }
            return false;
          }
        }

        var handler;

        if(this.wildcard) {
          handler = [];
          var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
          searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
        }
        else {
          handler = this._events[type];
        }

        if (typeof handler === 'function') {
          this.event = type;
          if (arguments.length === 1) {
            handler.call(this);
          }
          else if (arguments.length > 1)
            switch (arguments.length) {
              case 2:
                handler.call(this, arguments[1]);
                break;
              case 3:
                handler.call(this, arguments[1], arguments[2]);
                break;
              // slower
              default:
                var l = arguments.length;
                var args = new Array(l - 1);
                for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
                handler.apply(this, args);
            }
          return true;
        }
        else if (handler) {
          var l = arguments.length;
          var args = new Array(l - 1);
          for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

          var listeners = handler.slice();
          for (var i = 0, l = listeners.length; i < l; i++) {
            this.event = type;
            listeners[i].apply(this, args);
          }
          return (listeners.length > 0) || this._all;
        }
        else {
          return this._all;
        }

      };

      EventEmitter.prototype.on = function(type, listener) {

        if (typeof type === 'function') {
          this.onAny(type);
          return this;
        }

        if (typeof listener !== 'function') {
          throw new Error('on only accepts instances of Function');
        }
        this._events || init.call(this);

        // To avoid recursion in the case that type == "newListeners"! Before
        // adding it to the listeners, first emit "newListeners".
        this.emit('newListener', type, listener);

        if(this.wildcard) {
          growListenerTree.call(this, type, listener);
          return this;
        }

        if (!this._events[type]) {
          // Optimize the case of one listener. Don't need the extra array object.
          this._events[type] = listener;
        }
        else if(typeof this._events[type] === 'function') {
          // Adding the second element, need to change to array.
          this._events[type] = [this._events[type], listener];
        }
        else if (isArray(this._events[type])) {
          // If we've already got an array, just append.
          this._events[type].push(listener);

          // Check for listener leak
          if (!this._events[type].warned) {

            var m = defaultMaxListeners;

            if (typeof this._events.maxListeners !== 'undefined') {
              m = this._events.maxListeners;
            }

            if (m > 0 && this._events[type].length > m) {

              this._events[type].warned = true;
              console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            this._events[type].length);
              console.trace();
            }
          }
        }
        return this;
      };

      EventEmitter.prototype.onAny = function(fn) {

        if(!this._all) {
          this._all = [];
        }

        if (typeof fn !== 'function') {
          throw new Error('onAny only accepts instances of Function');
        }

        // Add the function to the event listener collection.
        this._all.push(fn);
        return this;
      };

      EventEmitter.prototype.addListener = EventEmitter.prototype.on;

      EventEmitter.prototype.off = function(type, listener) {
        if (typeof listener !== 'function') {
          throw new Error('removeListener only takes instances of Function');
        }

        var handlers,leafs=[];

        if(this.wildcard) {
          var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
          leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);
        }
        else {
          // does not use listeners(), so no side effect of creating _events[type]
          if (!this._events[type]) return this;
          handlers = this._events[type];
          leafs.push({_listeners:handlers});
        }

        for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
          var leaf = leafs[iLeaf];
          handlers = leaf._listeners;
          if (isArray(handlers)) {

            var position = -1;

            for (var i = 0, length = handlers.length; i < length; i++) {
              if (handlers[i] === listener ||
                (handlers[i].listener && handlers[i].listener === listener) ||
                (handlers[i]._origin && handlers[i]._origin === listener)) {
                position = i;
                break;
              }
            }

            if (position < 0) {
              continue;
            }

            if(this.wildcard) {
              leaf._listeners.splice(position, 1);
            }
            else {
              this._events[type].splice(position, 1);
            }

            if (handlers.length === 0) {
              if(this.wildcard) {
                delete leaf._listeners;
              }
              else {
                delete this._events[type];
              }
            }
            return this;
          }
          else if (handlers === listener ||
            (handlers.listener && handlers.listener === listener) ||
            (handlers._origin && handlers._origin === listener)) {
            if(this.wildcard) {
              delete leaf._listeners;
            }
            else {
              delete this._events[type];
            }
          }
        }

        return this;
      };

      EventEmitter.prototype.offAny = function(fn) {
        var i = 0, l = 0, fns;
        if (fn && this._all && this._all.length > 0) {
          fns = this._all;
          for(i = 0, l = fns.length; i < l; i++) {
            if(fn === fns[i]) {
              fns.splice(i, 1);
              return this;
            }
          }
        } else {
          this._all = [];
        }
        return this;
      };

      EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

      EventEmitter.prototype.removeAllListeners = function(type) {
        if (arguments.length === 0) {
          !this._events || init.call(this);
          return this;
        }

        if(this.wildcard) {
          var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
          var leafs = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

          for (var iLeaf=0; iLeaf<leafs.length; iLeaf++) {
            var leaf = leafs[iLeaf];
            leaf._listeners = null;
          }
        }
        else {
          if (!this._events[type]) return this;
          this._events[type] = null;
        }
        return this;
      };

      EventEmitter.prototype.listeners = function(type) {
        if(this.wildcard) {
          var handlers = [];
          var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
          searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
          return handlers;
        }

        this._events || init.call(this);

        if (!this._events[type]) this._events[type] = [];
        if (!isArray(this._events[type])) {
          this._events[type] = [this._events[type]];
        }
        return this._events[type];
      };

      EventEmitter.prototype.listenersAny = function() {

        if(this._all) {
          return this._all;
        }
        else {
          return [];
        }

      };

      if (typeof define === 'function' && define.amd) {
        define(function() {
          return EventEmitter;
        });
      } else {
        exports.EventEmitter2 = EventEmitter;
      }

    }(typeof process !== 'undefined' && typeof process.title !== 'undefined' && typeof exports !== 'undefined' ? exports : window);

    Atomic._.EventEmitter = module.exports.EventEmitter2;    
  });

  cjsHarness(function(module, exports, process) {
    /**
     * bluebird build version 0.9.11-0
     * Features enabled: core, race, any, call_get, filter, generators, map, nodeify, promisify, props, reduce, settle, some, progress, cancel, complex_thenables, synchronous_inspection
     * Features disabled: simple_thenables
    */
    /**
     * @preserve Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    ;(function (f) {
      // CommonJS
      if (typeof exports === "object") {
        module.exports = f();

      // RequireJS
      } else if (typeof define === "function" && define.amd) {
        define(f);

      // <script>
      } else {
        if (typeof window !== "undefined") {
          window.Promise = f();
        } else if (typeof global !== "undefined") {
          global.Promise = f();
        } else if (typeof self !== "undefined") {
          self.Promise = f();
        }
      }

    })(function () {var define,module,exports;
    return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, Promise$_All, PromiseArray ) {

        var SomePromiseArray = require( "./some_promise_array.js" )(PromiseArray);

        function Promise$_Any( promises, useBound, caller ) {
            var ret = Promise$_All(
                promises,
                SomePromiseArray,
                caller,
                useBound === true ? promises._boundTo : void 0
            );
            ret.setHowMany( 1 );
            ret.setUnwrap();
            return ret.promise();
        }

        Promise.any = function Promise$Any( promises ) {
            return Promise$_Any( promises, false, Promise.any );
        };

        Promise.prototype.any = function Promise$any() {
            return Promise$_Any( this, true, this.any );
        };

    };

    },{"./some_promise_array.js":34}],2:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = (function(){
        var AssertionError = (function() {
            function AssertionError( a ) {
                this.constructor$( a );
                this.message = a;
                this.name = "AssertionError";
            }
            AssertionError.prototype = new Error();
            AssertionError.prototype.constructor = AssertionError;
            AssertionError.prototype.constructor$ = Error;
            return AssertionError;
        })();

        return function assert( boolExpr, message ) {
            if( boolExpr === true ) return;

            var ret = new AssertionError( message );
            if( Error.captureStackTrace ) {
                Error.captureStackTrace( ret, assert );
            }
            if( console && console.error ) {
                console.error( ret.stack + "" );
            }
            throw ret;

        };
    })();

    },{}],3:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var ASSERT = require("./assert.js");
    var schedule = require( "./schedule.js" );
    var Queue = require( "./queue.js" );
    var errorObj = require( "./util.js").errorObj;
    var tryCatch1 = require( "./util.js").tryCatch1;

    function Async() {
        this._isTickUsed = false;
        this._length = 0;
        this._lateBuffer = new Queue();
        this._functionBuffer = new Queue( 25000 * 3 );
        var self = this;
        this.consumeFunctionBuffer = function Async$consumeFunctionBuffer() {
            self._consumeFunctionBuffer();
        };
    }

    Async.prototype.haveItemsQueued = function Async$haveItemsQueued() {
        return this._length > 0;
    };

    Async.prototype.invokeLater = function Async$invokeLater( fn, receiver, arg ) {
        this._lateBuffer.push( fn, receiver, arg );
        this._queueTick();
    };

    Async.prototype.invoke = function Async$invoke( fn, receiver, arg ) {
        var functionBuffer = this._functionBuffer;
        functionBuffer.push( fn, receiver, arg );
        this._length = functionBuffer.length();
        this._queueTick();
    };

    Async.prototype._consumeFunctionBuffer =
    function Async$_consumeFunctionBuffer() {
        var functionBuffer = this._functionBuffer;
        while( functionBuffer.length() > 0 ) {
            var fn = functionBuffer.shift();
            var receiver = functionBuffer.shift();
            var arg = functionBuffer.shift();
            fn.call( receiver, arg );
        }
        this._reset();
        this._consumeLateBuffer();
    };

    Async.prototype._consumeLateBuffer = function Async$_consumeLateBuffer() {
        var buffer = this._lateBuffer;
        while( buffer.length() > 0 ) {
            var fn = buffer.shift();
            var receiver = buffer.shift();
            var arg = buffer.shift();
            var res = tryCatch1( fn, receiver, arg );
            if( res === errorObj ) {
                this._queueTick();
                throw res.e;
            }
        }
    };

    Async.prototype._queueTick = function Async$_queue() {
        if( !this._isTickUsed ) {
            schedule( this.consumeFunctionBuffer );
            this._isTickUsed = true;
        }
    };

    Async.prototype._reset = function Async$_reset() {
        this._isTickUsed = false;
        this._length = 0;
    };

    module.exports = new Async();

    },{"./assert.js":2,"./queue.js":26,"./schedule.js":30,"./util.js":36}],4:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var Promise = require("./promise.js")();
    module.exports = Promise;
    },{"./promise.js":18}],5:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
        Promise.prototype.call = function Promise$call( propertyName ) {
            var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}

            return this._then( function( obj ) {
                    return obj[ propertyName ].apply( obj, args );
                },
                void 0,
                void 0,
                void 0,
                void 0,
                this.call
            );
        };

        function Promise$getter( obj ) {
            var prop = typeof this === "string"
                ? this
                : ("" + this);
            return obj[ prop ];
        }
        Promise.prototype.get = function Promise$get( propertyName ) {
            return this._then(
                Promise$getter,
                void 0,
                void 0,
                propertyName,
                void 0,
                this.get
            );
        };
    };

    },{}],6:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
        var errors = require( "./errors.js" );
        var async = require( "./async.js" );
        var CancellationError = errors.CancellationError;

        Promise.prototype.cancel = function Promise$cancel() {
            if( !this.isCancellable() ) return this;
            var cancelTarget = this;
            while( cancelTarget._cancellationParent !== void 0 ) {
                cancelTarget = cancelTarget._cancellationParent;
            }
            if( cancelTarget === this ) {
                var err = new CancellationError();
                this._attachExtraTrace( err );
                this._reject( err );
            }
            else {
                async.invoke( cancelTarget.cancel, cancelTarget, void 0 );
            }
            return this;
        };

        Promise.prototype.uncancellable = function Promise$uncancellable() {
            var ret = new Promise();
            ret._setTrace( this.uncancellable, this );
            ret._unsetCancellable();
            ret._assumeStateOf( this, true );
            ret._boundTo = this._boundTo;
            return ret;
        };

        Promise.prototype.fork =
        function Promise$fork( didFulfill, didReject, didProgress ) {
            var ret = this._then( didFulfill, didReject, didProgress,
                void 0, void 0, this.fork );
            ret._cancellationParent = void 0;
            return ret;
        };
    };

    },{"./async.js":3,"./errors.js":10}],7:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function() {
    var ASSERT = require("./assert.js");
    var inherits = require( "./util.js").inherits;

    var rignore = new RegExp(
        "\\b(?:Promise(?:Array|Spawn)?\\$_\\w+|tryCatch(?:1|2|Apply)|setTimeout" +
        "|CatchFilter\\$_\\w+|makeNodePromisified|processImmediate|nextTick" +
        "|Async\\$\\w+)\\b"
    );

    var rtraceline = null;
    var formatStack = null;
    var areNamesMangled = false;

    function CapturedTrace( ignoreUntil, isTopLevel ) {
        if( !areNamesMangled ) {
        }
        this.captureStackTrace( ignoreUntil, isTopLevel );

    }
    inherits( CapturedTrace, Error );

    CapturedTrace.prototype.captureStackTrace =
    function CapturedTrace$captureStackTrace( ignoreUntil, isTopLevel ) {
        captureStackTrace( this, ignoreUntil, isTopLevel );
    };

    CapturedTrace.possiblyUnhandledRejection =
    function CapturedTrace$PossiblyUnhandledRejection( reason ) {
        if( typeof console === "object" ) {
            var stack = reason.stack;
            var message = "Possibly unhandled " + formatStack( stack, reason );
            if( typeof console.error === "function" ||
                typeof console.error === "object" ) {
                console.error( message );
            }
            else if( typeof console.log === "function" ||
                typeof console.error === "object" ) {
                console.log( message );
            }
        }
    };

    areNamesMangled = CapturedTrace.prototype.captureStackTrace.name !==
        "CapturedTrace$captureStackTrace";

    CapturedTrace.combine = function CapturedTrace$Combine( current, prev ) {
        var curLast = current.length - 1;
        for( var i = prev.length - 1; i >= 0; --i ) {
            var line = prev[i];
            if( current[ curLast ] === line ) {
                current.pop();
                curLast--;
            }
            else {
                break;
            }
        }

        current.push( "From previous event:" );
        var lines = current.concat( prev );

        var ret = [];


        for( var i = 0, len = lines.length; i < len; ++i ) {

            if( ( rignore.test( lines[i] ) ||
                ( i > 0 && !rtraceline.test( lines[i] ) ) &&
                lines[i] !== "From previous event:" )
            ) {
                continue;
            }
            ret.push( lines[i] );
        }
        return ret;
    };

    CapturedTrace.isSupported = function CapturedTrace$IsSupported() {
        return typeof captureStackTrace === "function";
    };

    var captureStackTrace = (function stackDetection() {
        function snip( str ) {
            var maxChars = 41;
            if( str.length < maxChars ) {
                return str;
            }
            return str.substr(0, maxChars - 3) + "...";
        }

        function formatNonError( obj ) {
            var str = obj.toString();
            var ruselessToString = /\[object [a-zA-Z0-9$_]+\]/;
            if( ruselessToString.test( str ) ) {
                try {
                    var newStr = JSON.stringify(obj);
                    str = newStr;
                }
                catch( e ) {

                }
            }
            return ("(<" + snip( str ) + ">, no stack trace)");
        }

        if( typeof Error.stackTraceLimit === "number" &&
            typeof Error.captureStackTrace === "function" ) {
            rtraceline = /^\s*at\s*/;
            formatStack = function( stack, error ) {
                if( typeof stack === "string" ) return stack;

                if( error.name !== void 0 &&
                    error.message !== void 0 ) {
                    return error.name + ". " + error.message;
                }
                return formatNonError( error );


            };
            var captureStackTrace = Error.captureStackTrace;
            return function CapturedTrace$_captureStackTrace(
                receiver, ignoreUntil, isTopLevel ) {
                var prev = -1;
                if( !isTopLevel ) {
                    prev = Error.stackTraceLimit;
                    Error.stackTraceLimit =
                        Math.max(1, Math.min(10000, prev) / 3 | 0);
                }
                captureStackTrace( receiver, ignoreUntil );

                if( !isTopLevel ) {
                    Error.stackTraceLimit = prev;
                }
            };
        }
        var err = new Error();

        if( !areNamesMangled && typeof err.stack === "string" &&
            typeof "".startsWith === "function" &&
            ( err.stack.startsWith("stackDetection@")) &&
            stackDetection.name === "stackDetection" ) {

            Object.defineProperty( Error, "stackTraceLimit", {
                writable: true,
                enumerable: false,
                configurable: false,
                value: 25
            });
            rtraceline = /@/;
            var rline = /[@\n]/;

            formatStack = function( stack, error ) {
                if( typeof stack === "string" ) {
                    return ( error.name + ". " + error.message + "\n" + stack );
                }

                if( error.name !== void 0 &&
                    error.message !== void 0 ) {
                    return error.name + ". " + error.message;
                }
                return formatNonError( error );
            };

            return function captureStackTrace(o, fn) {
                var name = fn.name;
                var stack = new Error().stack;
                var split = stack.split( rline );
                var i, len = split.length;
                for (i = 0; i < len; i += 2) {
                    if (split[i] === name) {
                        break;
                    }
                }
                split = split.slice(i + 2);
                len = split.length - 2;
                var ret = "";
                for (i = 0; i < len; i += 2) {
                    ret += split[i];
                    ret += "@";
                    ret += split[i + 1];
                    ret += "\n";
                }
                o.stack = ret;
            };
        }
        else {
            formatStack = function( stack, error ) {
                if( typeof stack === "string" ) return stack;

                if( ( typeof error === "object" ||
                    typeof error === "function" ) &&
                    error.name !== void 0 &&
                    error.message !== void 0 ) {
                    return error.name + ". " + error.message;
                }
                return formatNonError( error );
            };

            return null;
        }
    })();

    return CapturedTrace;
    };

    },{"./assert.js":2,"./util.js":36}],8:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var ensureNotHandled = require( "./errors.js" ).ensureNotHandled;
    var util = require( "./util.js");
    var tryCatch1 = util.tryCatch1;
    var errorObj = util.errorObj;

    function CatchFilter( instances, callback, promise ) {
        this._instances = instances;
        this._callback = callback;
        this._promise = promise;
    }


    function CatchFilter$_safePredicate( predicate, e ) {
        var safeObject = {};
        var retfilter = tryCatch1( predicate, safeObject, e );

        if( retfilter === errorObj ) return retfilter;

        var safeKeys = Object.keys(safeObject);
        if( safeKeys.length ) {
            errorObj.e = new TypeError(
                "Catch filter must inherit from Error "
              + "or be a simple predicate function" );
            return errorObj;
        }
        return retfilter;
    }

    CatchFilter.prototype.doFilter = function CatchFilter$_doFilter( e ) {
        var cb = this._callback;

        for( var i = 0, len = this._instances.length; i < len; ++i ) {
            var item = this._instances[i];
            var itemIsErrorType = item === Error ||
                ( item != null && item.prototype instanceof Error );

            if( itemIsErrorType && e instanceof item ) {
                var ret = tryCatch1( cb, this._promise._boundTo, e );
                if( ret === errorObj ) {
                    throw ret.e;
                }
                return ret;
            } else if( typeof item === "function" && !itemIsErrorType ) {
                var shouldHandle = CatchFilter$_safePredicate(item, e);
                if( shouldHandle === errorObj ) {
                    this._promise._attachExtraTrace( errorObj.e );
                    e = errorObj.e;
                    break;
                } else if(shouldHandle) {
                    var ret = tryCatch1( cb, this._promise._boundTo, e );
                    if( ret === errorObj ) {
                        throw ret.e;
                    }
                    return ret;
                }
            }
        }
        ensureNotHandled( e );
        throw e;
    };

    module.exports = CatchFilter;

    },{"./errors.js":10,"./util.js":36}],9:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
        var ASSERT = require("./assert.js");
        var async = require( "./async.js" );
        var util = require( "./util.js" );
        var isPrimitive = util.isPrimitive;
        var errorObj = util.errorObj;
        var isObject = util.isObject;
        var tryCatch2 = util.tryCatch2;

        function Thenable() {
            this.errorObj = errorObj;
            this.__id__ = 0;
            this.treshold = 1000;
            this.thenableCache = new Array( this.treshold );
            this.promiseCache = new Array( this.treshold );
            this._compactQueued = false;
        }
        Thenable.prototype.couldBe = function Thenable$couldBe( ret ) {
            if( isPrimitive( ret ) ) {
                return false;
            }
            var id = ret.__id_$thenable__;
            if( typeof id === "number" &&
                this.thenableCache[id] !== void 0 ) {
                return true;
            }
            return ("then" in ret);
        };

        Thenable.prototype.is = function Thenable$is( ret, ref ) {
            var id = ret.__id_$thenable__;
            if( typeof id === "number" &&
                this.thenableCache[id] !== void 0 ) {
                ref.ref = this.thenableCache[id];
                ref.promise = this.promiseCache[id];
                return true;
            }
            return this._thenableSlowCase( ret, ref );
        };

        Thenable.prototype.addCache =
        function Thenable$_addCache( thenable, promise ) {
            var id = this.__id__;
            this.__id__ = id + 1;
            var descriptor = this._descriptor( id );
            Object.defineProperty( thenable, "__id_$thenable__", descriptor );
            this.thenableCache[id] = thenable;
            this.promiseCache[id] = promise;
            if( this.thenableCache.length > this.treshold &&
                !this._compactQueued) {
                this._compactQueued = true;
                async.invokeLater( this._compactCache, this, void 0 );
            }
        };

        Thenable.prototype.deleteCache = function Thenable$deleteCache( thenable ) {
            var id = thenable.__id_$thenable__;
            if( id === -1 ) {
                return;
            }
            this.thenableCache[id] = void 0;
            this.promiseCache[id] = void 0;
            thenable.__id_$thenable__ = -1;    };

        var descriptor = {
            value: 0,
            enumerable: false,
            writable: true,
            configurable: true
        };
        Thenable.prototype._descriptor = function Thenable$_descriptor( id ) {
            descriptor.value = id;
            return descriptor;
        };

        Thenable.prototype._compactCache = function Thenable$_compactCache() {
            var arr = this.thenableCache;
            var promiseArr = this.promiseCache;
            var skips = 0;
            var j = 0;
            for( var i = 0, len = arr.length; i < len; ++i ) {
                var item = arr[ i ];
                if( item === void 0 ) {
                    skips++;
                }
                else {
                    promiseArr[ j ] = promiseArr[ i ];
                    item.__id_$thenable__ = j;
                    arr[ j++ ] = item;
                }
            }
            var newId = arr.length - skips;
            if( newId === this.__id__ ) {
                this.treshold *= 2;
            }
            else for( var i = newId, len = arr.length; i < len; ++i ) {
                promiseArr[ j ] = arr[ i ] = void 0;
            }

            this.__id__ = newId;
            this._compactQueued = false;
        };

        Thenable.prototype._thenableSlowCase =
        function Thenable$_thenableSlowCase( ret, ref ) {
            try {
                var then = ret.then;
                if( typeof then === "function" ) {
                    ref.ref = then;
                    return true;
                }
                return false;
            }
            catch(e) {
                this.errorObj.e = e;
                ref.ref = this.errorObj;
                return true;
            }
        };

        var thenable = new Thenable( errorObj );

        Promise._couldBeThenable = function( val ) {
            return thenable.couldBe( val );
        };

        function doThenable( obj, ref, caller ) {
            if( ref.promise != null ) {
                return ref.promise;
            }
            var resolver = Promise.pending( caller );
            var result = ref.ref;
            if( result === errorObj ) {
                resolver.reject( result.e );
                return resolver.promise;
            }
            thenable.addCache( obj, resolver.promise );
            var called = false;
            var ret = tryCatch2( result, obj, function t( a ) {
                if( called ) return;
                called = true;
                async.invoke( thenable.deleteCache, thenable, obj );
                var b = Promise$_Cast( a );
                if( b === a ) {
                    resolver.fulfill( a );
                }
                else {
                    if( a === obj ) {
                        resolver.promise._resolveFulfill( a );
                    }
                    else {
                        b._then(
                            resolver.fulfill,
                            resolver.reject,
                            void 0,
                            resolver,
                            void 0,
                            t
                        );
                    }
                }
            }, function t( a ) {
                if( called ) return;
                called = true;
                async.invoke( thenable.deleteCache, thenable, obj );
                resolver.reject( a );
            });
            if( ret === errorObj && !called ) {
                resolver.reject( ret.e );
                async.invoke( thenable.deleteCache, thenable, obj );
            }
            return resolver.promise;
        }

        function Promise$_Cast( obj, caller ) {
            if( isObject( obj ) ) {
                if( obj instanceof Promise ) {
                    return obj;
                }
                var ref = { ref: null, promise: null };
                if( thenable.is( obj, ref ) ) {
                    caller = typeof caller === "function" ? caller : Promise$_Cast;
                    return doThenable( obj, ref, caller );
                }
            }
            return obj;
        }

        Promise.prototype._resolveThenable =
        function Promise$_resolveThenable( x, ref ) {
            if( ref.promise != null ) {
                this._assumeStateOf( ref.promise, true );
                return;
            }
            if( ref.ref === errorObj ) {
                this._attachExtraTrace( ref.ref.e );
                async.invoke( this._reject, this, ref.ref.e );
            }
            else {
                thenable.addCache( x, this );
                var then = ref.ref;
                var localX = x;
                var localP = this;
                var key = {};
                var called = false;
                var t = function t( v ) {
                    if( called && this !== key ) return;
                    called = true;
                    var fn = localP._fulfill;
                    var b = Promise$_Cast( v );

                    if( b !== v ||
                        ( b instanceof Promise && b.isPending() ) ) {
                        if( v === x ) {
                            async.invoke( fn, localP, v );
                            async.invoke( thenable.deleteCache, thenable, localX );
                        }
                        else {
                            b._then( t, r, void 0, key, void 0, t);
                        }
                        return;
                    }


                    if( b instanceof Promise ) {
                        var fn = b.isFulfilled()
                            ? localP._fulfill : localP._reject;
                        v = v._resolvedValue;
                        b = Promise$_Cast( v );
                        if( b !== v ||
                            ( b instanceof Promise && b !== v ) ) {
                            b._then( t, r, void 0, key, void 0, t);
                            return;
                        }
                    }
                    async.invoke( fn, localP, v );
                    async.invoke( thenable.deleteCache,
                            thenable, localX );
                };

                var r = function r( v ) {
                    if( called && this !== key ) return;
                    var fn = localP._reject;
                    called = true;

                    var b = Promise$_Cast( v );

                    if( b !== v ||
                        ( b instanceof Promise && b.isPending() ) ) {
                        if( v === x ) {
                            async.invoke( fn, localP, v );
                            async.invoke( thenable.deleteCache, thenable, localX );
                        }
                        else {
                            b._then( t, r, void 0, key, void 0, t);
                        }
                        return;
                    }


                    if( b instanceof Promise ) {
                        var fn = b.isFulfilled()
                            ? localP._fulfill : localP._reject;
                        v = v._resolvedValue;
                        b = Promise$_Cast( v );
                        if( b !== v ||
                            ( b instanceof Promise && b.isPending() ) ) {
                            b._then( t, r, void 0, key, void 0, t);
                            return;
                        }
                    }

                    async.invoke( fn, localP, v );
                    async.invoke( thenable.deleteCache,
                        thenable, localX );

                };
                var threw = tryCatch2( then, x, t, r);
                if( threw === errorObj &&
                    !called ) {
                    this._attachExtraTrace( threw.e );
                    async.invoke( this._reject, this, threw.e );
                    async.invoke( thenable.deleteCache, thenable, x );
                }
            }
        };

        Promise.prototype._tryThenable = function Promise$_tryThenable( x ) {
            var ref;
            if( !thenable.is( x, ref = {ref: null, promise: null} ) ) {
                return false;
            }
            this._resolveThenable( x, ref );
            return true;
        };

        Promise._cast = Promise$_Cast;
    };
    },{"./assert.js":2,"./async.js":3,"./util.js":36}],10:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var global = require("./global.js");
    var Objectfreeze = global.Object.freeze;
    var util = require( "./util.js");
    var inherits = util.inherits;
    var isObject = util.isObject;
    var notEnumerableProp = util.notEnumerableProp;
    var Error = global.Error;

    function isStackAttached( val ) {
        return ( val & 1 ) > 0;
    }

    function isHandled( val ) {
        return ( val & 2 ) > 0;
    }

    function withStackAttached( val ) {
        return ( val | 1 );
    }

    function withHandledMarked( val ) {
        return ( val | 2 );
    }

    function withHandledUnmarked( val ) {
        return ( val & ( ~2 ) );
    }

    function ensureNotHandled( reason ) {
        var field;
        if( isObject( reason ) &&
            ( ( field = reason["__promiseHandled__"] ) !== void 0 ) ) {
            reason["__promiseHandled__"] = withHandledUnmarked( field );
        }
    }

    function attachDefaultState( obj ) {
        try {
            notEnumerableProp( obj, "__promiseHandled__", 0 );
            return true;
        }
        catch( e ) {
            return false;
        }
    }

    function isError( obj ) {
        return obj instanceof Error;
    }

    function canAttach( obj ) {
        if( isError( obj ) ) {
            var handledState = obj["__promiseHandled__"];
            if( handledState === void 0 ) {
                return attachDefaultState( obj );
            }
            return !isStackAttached( handledState );
        }
        return false;
    }

    function subError( nameProperty, defaultMessage ) {
        function SubError( message ) {
            this.message = typeof message === "string" ? message : defaultMessage;
            this.name = nameProperty;
            if( Error.captureStackTrace ) {
                Error.captureStackTrace( this, this.constructor );
            }
        }
        inherits( SubError, Error );
        return SubError;
    }

    var TypeError = global.TypeError;
    if( typeof TypeError !== "function" ) {
        TypeError = subError( "TypeError", "type error" );
    }
    var CancellationError = subError( "CancellationError", "cancellation error" );
    var TimeoutError = subError( "TimeoutError", "timeout error" );

    function RejectionError( message ) {
        this.name = "RejectionError";
        this.message = message;
        this.cause = message;

        if( message instanceof Error ) {
            this.message = message.message;
            this.stack = message.stack;
        }
        else if( Error.captureStackTrace ) {
            Error.captureStackTrace( this, this.constructor );
        }

    }
    inherits( RejectionError, Error );

    var key = "__BluebirdErrorTypes__";
    var errorTypes = global[key];
    if( !errorTypes ) {
        errorTypes = Objectfreeze({
            CancellationError: CancellationError,
            TimeoutError: TimeoutError,
            RejectionError: RejectionError
        });
        notEnumerableProp( global, key, errorTypes );
    }

    module.exports = {
        Error: Error,
        TypeError: TypeError,
        CancellationError: errorTypes.CancellationError,
        RejectionError: errorTypes.RejectionError,
        TimeoutError: errorTypes.TimeoutError,
        attachDefaultState: attachDefaultState,
        ensureNotHandled: ensureNotHandled,
        withHandledUnmarked: withHandledUnmarked,
        withHandledMarked: withHandledMarked,
        withStackAttached: withStackAttached,
        isStackAttached: isStackAttached,
        isHandled: isHandled,
        canAttach: canAttach
    };

    },{"./global.js":14,"./util.js":36}],11:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function(Promise) {
    var TypeError = require('./errors.js').TypeError;

    function apiRejection( msg ) {
        var error = new TypeError( msg );
        var ret = Promise.rejected( error );
        var parent = ret._peekContext();
        if( parent != null ) {
            parent._attachExtraTrace( error );
        }
        return ret;
    }

    return apiRejection;
    };
    },{"./errors.js":10}],12:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, Promise$_All, PromiseArray, apiRejection ) {

        var ASSERT = require( "./assert.js" );

        function Promise$_filterer( fulfilleds ) {
            var fn = this;
            var receiver = void 0;
            if( typeof fn !== "function" )  {
                receiver = fn.receiver;
                fn = fn.fn;
            }
            var ret = new Array( fulfilleds.length );
            var j = 0;
            if( receiver === void 0 ) {
                 for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
                    var item = fulfilleds[i];
                    if( item === void 0 &&
                        !( i in fulfilleds ) ) {
                        continue;
                    }
                    if( fn( item, i, len ) ) {
                        ret[j++] = item;
                    }
                }
            }
            else {
                for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
                    var item = fulfilleds[i];
                    if( item === void 0 &&
                        !( i in fulfilleds ) ) {
                        continue;
                    }
                    if( fn.call( receiver, item, i, len ) ) {
                        ret[j++] = item;
                    }
                }
            }
            ret.length = j;
            return ret;
        }

        function Promise$_Filter( promises, fn, useBound, caller ) {
            if( typeof fn !== "function" ) {
                return apiRejection( "fn is not a function" );
            }

            if( useBound === true ) {
                fn = {
                    fn: fn,
                    receiver: promises._boundTo
                };
            }

            return Promise$_All( promises, PromiseArray, caller,
                    useBound === true ? promises._boundTo : void 0 )
                .promise()
                ._then( Promise$_filterer, void 0, void 0, fn, void 0, caller );
        }

        Promise.filter = function Promise$Filter( promises, fn ) {
            return Promise$_Filter( promises, fn, false, Promise.filter );
        };

        Promise.prototype.filter = function Promise$filter( fn ) {
            return Promise$_Filter( this, fn, true, this.filter );
        };
    };

    },{"./assert.js":2}],13:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, apiRejection ) {
        var PromiseSpawn = require( "./promise_spawn.js" )(Promise);
        var errors = require( "./errors.js");
        var TypeError = errors.TypeError;

        Promise.coroutine = function Promise$Coroutine( generatorFunction ) {
            if( typeof generatorFunction !== "function" ) {
                throw new TypeError( "generatorFunction must be a function" );
            }
            var PromiseSpawn$ = PromiseSpawn;
            return function anonymous() {
                var generator = generatorFunction.apply( this, arguments );
                var spawn = new PromiseSpawn$( void 0, void 0, anonymous );
                spawn._generator = generator;
                spawn._next( void 0 );
                return spawn.promise();
            };
        };

        Promise.spawn = function Promise$Spawn( generatorFunction ) {
            if( typeof generatorFunction !== "function" ) {
                return apiRejection( "generatorFunction must be a function" );
            }
            var spawn = new PromiseSpawn( generatorFunction, this, Promise.spawn );
            var ret = spawn.promise();
            spawn._run( Promise.spawn );
            return ret;
        };
    };

    },{"./errors.js":10,"./promise_spawn.js":22}],14:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = (function(){
        if( typeof this !== "undefined" ) {
            return this;
        }
        if( typeof process !== "undefined" &&
            typeof global !== "undefined" &&
            typeof process.execPath === "string" ) {
            return global;
        }
        if( typeof window !== "undefined" &&
            typeof document !== "undefined" &&
            typeof navigator !== "undefined" && navigator !== null &&
            typeof navigator.appName === "string" ) {
            return window;
        }
    })();

    },{}],15:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, Promise$_All, PromiseArray, apiRejection ) {

        var ASSERT = require( "./assert.js" );

        function Promise$_mapper( fulfilleds ) {
            var fn = this;
            var receiver = void 0;

            if( typeof fn !== "function" )  {
                receiver = fn.receiver;
                fn = fn.fn;
            }
            var shouldDefer = false;

            if( receiver === void 0 ) {
                for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
                    if( fulfilleds[i] === void 0 &&
                        !(i in fulfilleds) ) {
                        continue;
                    }
                    var fulfill = fn( fulfilleds[ i ], i, len );
                    if( !shouldDefer && Promise.is( fulfill ) ) {
                        if( fulfill.isFulfilled() ) {
                            fulfilleds[i] = fulfill._resolvedValue;
                            continue;
                        }
                        else {
                            shouldDefer = true;
                        }
                    }
                    fulfilleds[i] = fulfill;
                }
            }
            else {
                for( var i = 0, len = fulfilleds.length; i < len; ++i ) {
                    if( fulfilleds[i] === void 0 &&
                        !(i in fulfilleds) ) {
                        continue;
                    }
                    var fulfill = fn.call( receiver, fulfilleds[ i ], i, len );
                    if( !shouldDefer && Promise.is( fulfill ) ) {
                        if( fulfill.isFulfilled() ) {
                            fulfilleds[i] = fulfill._resolvedValue;
                            continue;
                        }
                        else {
                            shouldDefer = true;
                        }
                    }
                    fulfilleds[i] = fulfill;
                }
            }
            return shouldDefer
                ? Promise$_All( fulfilleds, PromiseArray,
                    Promise$_mapper, void 0 ).promise()
                : fulfilleds;
        }

        function Promise$_Map( promises, fn, useBound, caller ) {
            if( typeof fn !== "function" ) {
                return apiRejection( "fn is not a function" );
            }

            if( useBound === true ) {
                fn = {
                    fn: fn,
                    receiver: promises._boundTo
                };
            }

            return Promise$_All(
                promises,
                PromiseArray,
                caller,
                useBound === true ? promises._boundTo : void 0
            ).promise()
            ._then(
                Promise$_mapper,
                void 0,
                void 0,
                fn,
                void 0,
                caller
            );
        }

        Promise.prototype.map = function Promise$map( fn ) {
            return Promise$_Map( this, fn, true, this.map );
        };

        Promise.map = function Promise$Map( promises, fn ) {
            return Promise$_Map( promises, fn, false, Promise.map );
        };
    };

    },{"./assert.js":2}],16:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
        var util = require( "./util.js" );
        var async = require( "./async.js" );
        var ASSERT = require( "./assert.js" );
        var tryCatch2 = util.tryCatch2;
        var tryCatch1 = util.tryCatch1;
        var errorObj = util.errorObj;

        function thrower( r ) {
            throw r;
        }

        function Promise$_successAdapter( val, receiver ) {
            var nodeback = this;
            var ret = tryCatch2( nodeback, receiver, null, val );
            if( ret === errorObj ) {
                async.invokeLater( thrower, void 0, ret.e );
            }
        }
        function Promise$_errorAdapter( reason, receiver ) {
            var nodeback = this;
            var ret = tryCatch1( nodeback, receiver, reason );
            if( ret === errorObj ) {
                async.invokeLater( thrower, void 0, ret.e );
            }
        }

        Promise.prototype.nodeify = function Promise$nodeify( nodeback ) {
            if( typeof nodeback == "function" ) {
                this._then(
                    Promise$_successAdapter,
                    Promise$_errorAdapter,
                    void 0,
                    nodeback,
                    this._isBound() ? this._boundTo : null,
                    this.nodeify
                );
            }
            return this;
        };
    };

    },{"./assert.js":2,"./async.js":3,"./util.js":36}],17:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
        var ASSERT = require( "./assert.js");
        var util = require( "./util.js" );
        var async = require( "./async.js" );
        var tryCatch1 = util.tryCatch1;
        var errorObj = util.errorObj;

        Promise.prototype.progressed = function Promise$progressed( fn ) {
            return this._then( void 0, void 0, fn,
                                void 0, void 0, this.progressed );
        };

        Promise.prototype._progress = function Promise$_progress( progressValue ) {
            if( this._isFollowingOrFulfilledOrRejected() ) return;
            this._resolveProgress( progressValue );

        };

        Promise.prototype._progressAt = function Promise$_progressAt( index ) {
            if( index === 0 ) return this._progress0;
            return this[ index + 2 - 5 ];
        };

        Promise.prototype._resolveProgress =
        function Promise$_resolveProgress( progressValue ) {
            var len = this._length();
            for( var i = 0; i < len; i += 5 ) {
                var fn = this._progressAt( i );
                var promise = this._promiseAt( i );
                if( !Promise.is( promise ) ) {
                    fn.call( this._receiverAt( i ), progressValue, promise );
                    continue;
                }
                var ret = progressValue;
                if( fn !== void 0 ) {
                    this._pushContext();
                    ret = tryCatch1( fn, this._receiverAt( i ), progressValue );
                    this._popContext();
                    if( ret === errorObj ) {
                        if( ret.e != null &&
                            ret.e.name === "StopProgressPropagation" ) {
                            ret.e["__promiseHandled__"] = 2;
                        }
                        else {
                            promise._attachExtraTrace( ret.e );
                            async.invoke( promise._progress, promise, ret.e );
                        }
                    }
                    else if( Promise.is( ret ) ) {
                        ret._then( promise._progress, null, null, promise, void 0,
                            this._progress );
                    }
                    else {
                        async.invoke( promise._progress, promise, ret );
                    }
                }
                else {
                    async.invoke( promise._progress, promise, ret );
                }
            }
        };
    };
    },{"./assert.js":2,"./async.js":3,"./util.js":36}],18:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function() {
    var global = require("./global.js");
    var ASSERT = require("./assert.js");

    var util = require( "./util.js" );
    var async = require( "./async.js" );
    var errors = require( "./errors.js" );
    var PromiseArray = require( "./promise_array.js" )(Promise);

    var CapturedTrace = require( "./captured_trace.js")();
    var CatchFilter = require( "./catch_filter.js");
    var PromiseResolver = require( "./promise_resolver.js" );

    var isArray = util.isArray;
    var notEnumerableProp = util.notEnumerableProp;
    var isObject = util.isObject;
    var ensurePropertyExpansion = util.ensurePropertyExpansion;
    var errorObj = util.errorObj;
    var tryCatch1 = util.tryCatch1;
    var tryCatch2 = util.tryCatch2;
    var tryCatchApply = util.tryCatchApply;

    var TypeError = errors.TypeError;
    var CancellationError = errors.CancellationError;
    var TimeoutError = errors.TimeoutError;
    var RejectionError = errors.RejectionError;
    var ensureNotHandled = errors.ensureNotHandled;
    var withHandledMarked = errors.withHandledMarked;
    var withStackAttached = errors.withStackAttached;
    var isStackAttached = errors.isStackAttached;
    var isHandled = errors.isHandled;
    var canAttach = errors.canAttach;
    var apiRejection = require("./errors_api_rejection")(Promise);

    var APPLY = {};


    function isPromise( obj ) {
        if( typeof obj !== "object" ) return false;
        return obj instanceof Promise;
    }

    function Promise( resolver ) {
        this._bitField = 67108864;
        this._fulfill0 = void 0;
        this._reject0 = void 0;
        this._progress0 = void 0;
        this._promise0 = void 0;
        this._receiver0 = void 0;
        this._resolvedValue = void 0;
        this._cancellationParent = void 0;
        this._boundTo = void 0;
        if( longStackTraces ) this._traceParent = this._peekContext();
        if( typeof resolver === "function" ) this._resolveResolver( resolver );

    }

    Promise.prototype.bind = function Promise$bind( obj ) {
        var ret = new Promise();
        ret._setTrace( this.bind, this );
        ret._assumeStateOf( this, true );
        ret._setBoundTo( obj );
        return ret;
    };

    Promise.prototype.toString = function Promise$toString() {
        return "[object Promise]";
    };

    Promise.prototype.caught = Promise.prototype["catch"] =
    function Promise$catch( fn ) {
        var len = arguments.length;
        if( len > 1 ) {
            var catchInstances = new Array( len - 1 ),
                j = 0, i;
            for( i = 0; i < len - 1; ++i ) {
                var item = arguments[i];
                if( typeof item === "function" ) {
                    catchInstances[j++] = item;
                }
                else {
                    var catchFilterTypeError =
                        new TypeError(
                            "A catch filter must be an error constructor "
                            + "or a filter function");

                    this._attachExtraTrace( catchFilterTypeError );
                    async.invoke( this._reject, this, catchFilterTypeError );
                    return;
                }
            }
            catchInstances.length = j;
            fn = arguments[i];

            this._resetTrace( this.caught );
            var catchFilter = new CatchFilter( catchInstances, fn, this );
            return this._then( void 0, catchFilter.doFilter, void 0,
                catchFilter, void 0, this.caught );
        }
        return this._then( void 0, fn, void 0, void 0, void 0, this.caught );
    };

    function thrower( r ) {
        throw r;
    }
    function slowFinally( ret, reasonOrValue ) {
        if( this.isFulfilled() ) {
            return ret._then(function() {
                return reasonOrValue;
            }, thrower, void 0, this, void 0, slowFinally );
        }
        else {
            return ret._then(function() {
                ensureNotHandled( reasonOrValue );
                throw reasonOrValue;
            }, thrower, void 0, this, void 0, slowFinally );
        }
    }
    Promise.prototype.lastly = Promise.prototype["finally"] =
    function Promise$finally( fn ) {
        var r = function( reasonOrValue ) {
            var ret = this._isBound() ? fn.call( this._boundTo ) : fn();
            if( isPromise( ret ) ) {
                return slowFinally.call( this, ret, reasonOrValue );
            }

            if( this.isRejected() ) {
                ensureNotHandled( reasonOrValue );
                throw reasonOrValue;
            }
            return reasonOrValue;
        };
        return this._then( r, r, void 0, this, void 0, this.lastly );
    };

    Promise.prototype.then =
    function Promise$then( didFulfill, didReject, didProgress ) {
        return this._then( didFulfill, didReject, didProgress,
            void 0, void 0, this.then );
    };

    Promise.prototype.done =
    function Promise$done( didFulfill, didReject, didProgress ) {
        var promise = this._then( didFulfill, didReject, didProgress,
            void 0, void 0, this.done );
        promise._setIsFinal();
    };

    Promise.prototype.spread = function Promise$spread( didFulfill, didReject ) {
        return this._then( didFulfill, didReject, void 0,
            APPLY, void 0, this.spread );
    };
    Promise.prototype.isFulfilled = function Promise$isFulfilled() {
        return ( this._bitField & 268435456 ) > 0;
    };

    Promise.prototype.isRejected = function Promise$isRejected() {
        return ( this._bitField & 134217728 ) > 0;
    };

    Promise.prototype.isPending = function Promise$isPending() {
        return !this.isResolved();
    };

    Promise.prototype.isResolved = function Promise$isResolved() {
        return ( this._bitField & 402653184 ) > 0;
    };

    Promise.prototype.isCancellable = function Promise$isCancellable() {
        return !this.isResolved() &&
            this._cancellable();
    };

    Promise.prototype.toJSON = function Promise$toJSON() {
        var ret = {
            isFulfilled: false,
            isRejected: false,
            fulfillmentValue: void 0,
            rejectionReason: void 0
        };
        if( this.isFulfilled() ) {
            ret.fulfillmentValue = this._resolvedValue;
            ret.isFulfilled = true;
        }
        else if( this.isRejected() ) {
            ret.rejectionReason = this._resolvedValue;
            ret.isRejected = true;
        }
        return ret;
    };

    Promise.prototype.all = function Promise$all() {
        return Promise$_all( this, true, this.all );
    };

    Promise.is = isPromise;

    function Promise$_all( promises, useBound, caller ) {
        return Promise$_All(
            promises,
            PromiseArray,
            caller,
            useBound === true ? promises._boundTo : void 0
        ).promise();
    }
    Promise.all = function Promise$All( promises ) {
        return Promise$_all( promises, false, Promise.all );
    };

    Promise.join = function Promise$Join() {
        var $_len = arguments.length;var args = new Array($_len); for(var $_i = 0; $_i < $_len; ++$_i) {args[$_i] = arguments[$_i];}
        return Promise$_All( args, PromiseArray, Promise.join, void 0 ).promise();
    };
    Promise.fulfilled = function Promise$Fulfilled( value, caller ) {
        var ret = new Promise();
        ret._setTrace( typeof caller === "function"
            ? caller
            : Promise.fulfilled, void 0 );
        if( ret._tryAssumeStateOf( value, false ) ) {
            return ret;
        }
        ret._cleanValues();
        ret._setFulfilled();
        ret._resolvedValue = value;
        return ret;
    };

    Promise.rejected = function Promise$Rejected( reason ) {
        var ret = new Promise();
        ret._setTrace( Promise.rejected, void 0 );
        ret._cleanValues();
        ret._setRejected();
        ret._resolvedValue = reason;
        return ret;
    };

    Promise["try"] = Promise.attempt = function Promise$_Try( fn, args, ctx ) {

        if( typeof fn !== "function" ) {
            return apiRejection("fn must be a function");
        }
        var value = isArray( args )
            ? tryCatchApply( fn, args, ctx )
            : tryCatch1( fn, ctx, args );

        var ret = new Promise();
        ret._setTrace( Promise.attempt, void 0 );
        if( value === errorObj ) {
            ret._cleanValues();
            ret._setRejected();
            ret._resolvedValue = value.e;
            return ret;
        }

        var maybePromise = Promise._cast(value);
        if( maybePromise instanceof Promise ) {
            ret._assumeStateOf( maybePromise, true );
        }
        else {
            ret._cleanValues();
            ret._setFulfilled();
            ret._resolvedValue = value;
        }

        return ret;
    };

    Promise.pending = function Promise$Pending( caller ) {
        var promise = new Promise();
        promise._setTrace( typeof caller === "function"
                                  ? caller : Promise.pending, void 0 );
        return new PromiseResolver( promise );
    };

    Promise.bind = function Promise$Bind( obj ) {
        var ret = new Promise();
        ret._setTrace( Promise.bind, void 0 );
        ret._setFulfilled();
        ret._setBoundTo( obj );
        return ret;
    };

    Promise.cast = function Promise$Cast( obj, caller ) {
        var ret = Promise._cast( obj, caller );
        if( !( ret instanceof Promise ) ) {
            return Promise.fulfilled( ret, caller );
        }
        return ret;
    };

    Promise.onPossiblyUnhandledRejection =
    function Promise$OnPossiblyUnhandledRejection( fn ) {
        if( typeof fn === "function" ) {
            CapturedTrace.possiblyUnhandledRejection = fn;
        }
        else {
            CapturedTrace.possiblyUnhandledRejection = void 0;
        }
    };

    var longStackTraces = true || false || !!(
        typeof process !== "undefined" &&
        typeof process.execPath === "string" &&
        typeof process.env === "object" &&
        process.env[ "BLUEBIRD_DEBUG" ]
    );


    Promise.longStackTraces = function Promise$LongStackTraces() {
        if( async.haveItemsQueued() &&
            longStackTraces === false
        ) {
            throw new Error("Cannot enable long stack traces " +
            "after promises have been created");
        }
        longStackTraces = true;
    };

    Promise.hasLongStackTraces = function Promise$HasLongStackTraces() {
        return longStackTraces;
    };

    Promise.prototype._then =
    function Promise$_then(
        didFulfill,
        didReject,
        didProgress,
        receiver,
        internalData,
        caller
    ) {
        var haveInternalData = internalData !== void 0;
        var ret = haveInternalData ? internalData : new Promise();

        if( longStackTraces && !haveInternalData ) {
            var haveSameContext = this._peekContext() === this._traceParent;
            ret._traceParent = haveSameContext ? this._traceParent : this;
            ret._setTrace( typeof caller === "function" ?
                caller : this._then, this );

        }

        if( !haveInternalData ) {
            ret._boundTo = this._boundTo;
        }

        var callbackIndex =
            this._addCallbacks( didFulfill, didReject, didProgress, ret, receiver );

        if( this.isResolved() ) {
            async.invoke( this._resolveLast, this, callbackIndex );
        }
        else if( !haveInternalData && this.isCancellable() ) {
            ret._cancellationParent = this;
        }

        if( this._isDelegated() ) {
            this._unsetDelegated();
            var x = this._resolvedValue;
            if( !this._tryThenable( x ) ) {
                async.invoke( this._fulfill, this, x );
            }
        }
        return ret;
    };

    Promise.prototype._length = function Promise$_length() {
        return this._bitField & 16777215;
    };

    Promise.prototype._isFollowingOrFulfilledOrRejected =
    function Promise$_isFollowingOrFulfilledOrRejected() {
        return ( this._bitField & 939524096 ) > 0;
    };

    Promise.prototype._setLength = function Promise$_setLength( len ) {
        this._bitField = ( this._bitField & -16777216 ) |
            ( len & 16777215 ) ;
    };

    Promise.prototype._cancellable = function Promise$_cancellable() {
        return ( this._bitField & 67108864 ) > 0;
    };

    Promise.prototype._setFulfilled = function Promise$_setFulfilled() {
        this._bitField = this._bitField | 268435456;
    };

    Promise.prototype._setRejected = function Promise$_setRejected() {
        this._bitField = this._bitField | 134217728;
    };

    Promise.prototype._setFollowing = function Promise$_setFollowing() {
        this._bitField = this._bitField | 536870912;
    };

    Promise.prototype._setDelegated = function Promise$_setDelegated() {
        this._bitField = this._bitField | -1073741824;
    };

    Promise.prototype._setIsFinal = function Promise$_setIsFinal() {
        this._bitField = this._bitField | 33554432;
    };

    Promise.prototype._isFinal = function Promise$_isFinal() {
        return ( this._bitField & 33554432 ) > 0;
    };

    Promise.prototype._isDelegated = function Promise$_isDelegated() {
        return ( this._bitField & -1073741824 ) === -1073741824;
    };

    Promise.prototype._unsetDelegated = function Promise$_unsetDelegated() {
        this._bitField = this._bitField & ( ~-1073741824 );
    };

    Promise.prototype._setCancellable = function Promise$_setCancellable() {
        this._bitField = this._bitField | 67108864;
    };

    Promise.prototype._unsetCancellable = function Promise$_unsetCancellable() {
        this._bitField = this._bitField & ( ~67108864 );
    };

    Promise.prototype._receiverAt = function Promise$_receiverAt( index ) {
        var ret;
        if( index === 0 ) {
            ret = this._receiver0;
        }
        else {
            ret = this[ index + 4 - 5 ];
        }
        if( this._isBound() && ret === void 0 ) {
            return this._boundTo;
        }
        return ret;
    };

    Promise.prototype._promiseAt = function Promise$_promiseAt( index ) {
        if( index === 0 ) return this._promise0;
        return this[ index + 3 - 5 ];
    };

    Promise.prototype._fulfillAt = function Promise$_fulfillAt( index ) {
        if( index === 0 ) return this._fulfill0;
        return this[ index + 0 - 5 ];
    };

    Promise.prototype._rejectAt = function Promise$_rejectAt( index ) {
        if( index === 0 ) return this._reject0;
        return this[ index + 1 - 5 ];
    };

    Promise.prototype._unsetAt = function Promise$_unsetAt( index ) {
        if( index === 0 ) {
            this._fulfill0 =
            this._reject0 =
            this._progress0 =
            this._promise0 =
            this._receiver0 = void 0;
        }
        else {
            this[ index - 5 + 0 ] =
            this[ index - 5 + 1 ] =
            this[ index - 5 + 2 ] =
            this[ index - 5 + 3 ] =
            this[ index - 5 + 4 ] = void 0;
        }
    };

    Promise.prototype._resolveResolver =
    function Promise$_resolveResolver( resolver ) {
        this._setTrace( this._resolveResolver, void 0 );
        var p = new PromiseResolver( this );
        this._pushContext();
        var r = tryCatch2( resolver, this, function Promise$_fulfiller( val ) {
            p.fulfill( val );
        }, function Promise$_rejecter( val ) {
            p.reject( val );
        });
        this._popContext();
        if( r === errorObj ) {
            p.reject( r.e );
        }
    };

    Promise.prototype._addCallbacks = function Promise$_addCallbacks(
        fulfill,
        reject,
        progress,
        promise,
        receiver
    ) {
        fulfill = typeof fulfill === "function" ? fulfill : void 0;
        reject = typeof reject === "function" ? reject : void 0;
        progress = typeof progress === "function" ? progress : void 0;
        var index = this._length();

        if( index === 0 ) {
            this._fulfill0 = fulfill;
            this._reject0  = reject;
            this._progress0 = progress;
            this._promise0 = promise;
            this._receiver0 = receiver;
            this._setLength( index + 5 );
            return index;
        }

        this[ index - 5 + 0 ] = fulfill;
        this[ index - 5 + 1 ] = reject;
        this[ index - 5 + 2 ] = progress;
        this[ index - 5 + 3 ] = promise;
        this[ index - 5 + 4 ] = receiver;

        this._setLength( index + 5 );
        return index;
    };

    Promise.prototype._spreadSlowCase =
    function Promise$_spreadSlowCase( targetFn, promise, values, boundTo ) {
        promise._assumeStateOf(
                Promise$_All( values, PromiseArray, this._spreadSlowCase, boundTo )
                .promise()
                ._then( function() {
                    return targetFn.apply( boundTo, arguments );
                }, void 0, void 0, APPLY, void 0,
                        this._spreadSlowCase ),
            false
        );
    };

    Promise.prototype._setBoundTo = function Promise$_setBoundTo( obj ) {
        this._boundTo = obj;
    };

    Promise.prototype._isBound = function Promise$_isBound() {
        return this._boundTo !== void 0;
    };


    var ignore = CatchFilter.prototype.doFilter;
    Promise.prototype._resolvePromise = function Promise$_resolvePromise(
        onFulfilledOrRejected, receiver, value, promise
    ) {
        var isRejected = this.isRejected();

        if( isRejected &&
            typeof value === "object" &&
            value !== null ) {
            var handledState = value["__promiseHandled__"];

            if( handledState === void 0 ) {
                notEnumerableProp( value, "__promiseHandled__", 2 );
            }
            else {
                value["__promiseHandled__"] =
                    withHandledMarked( handledState );
            }
        }

        if( !isPromise( promise ) ) {
            return onFulfilledOrRejected.call( receiver, value, promise );
        }

        var x;
        if( !isRejected && receiver === APPLY ) {
            if( isArray( value ) ) {
                for( var i = 0, len = value.length; i < len; ++i ) {
                    if( isPromise( Promise._cast( value[i] ) ) ) {
                        this._spreadSlowCase(
                            onFulfilledOrRejected,
                            promise,
                            value,
                            this._boundTo
                        );
                        return;
                    }
                }
                promise._pushContext();
                x = tryCatchApply( onFulfilledOrRejected, value, this._boundTo );
            }
            else {
                this._spreadSlowCase( onFulfilledOrRejected, promise,
                        value, this._boundTo );
                return;
            }
        }
        else {
            promise._pushContext();
            x = tryCatch1( onFulfilledOrRejected, receiver, value );
        }

        promise._popContext();

        if( x === errorObj ) {
            ensureNotHandled(x.e);
            if( onFulfilledOrRejected !== ignore ) {
                promise._attachExtraTrace( x.e );
            }
            async.invoke( promise._reject, promise, x.e );
        }
        else if( x === promise ) {
            var selfResolutionError =
                new TypeError( "Circular thenable chain" );
            this._attachExtraTrace( selfResolutionError );
            async.invoke(
                promise._reject,
                promise,
                selfResolutionError
            );
        }
        else {
            if( promise._tryAssumeStateOf( x, true ) ) {
                return;
            }
            else if( Promise._couldBeThenable( x ) ) {

                if( promise._length() === 0 ) {
                    promise._resolvedValue = x;
                    promise._setDelegated();
                    return;
                }
                else if( promise._tryThenable( x ) ) {
                    return;
                }
            }
            async.invoke( promise._fulfill, promise, x );
        }
    };

    Promise.prototype._assumeStateOf =
    function Promise$_assumeStateOf( promise, mustAsync ) {
        this._setFollowing();
        if( promise.isPending() ) {
            if( promise._cancellable()  ) {
                this._cancellationParent = promise;
            }
            promise._then(
                this._resolveFulfill,
                this._resolveReject,
                this._resolveProgress,
                this,
                void 0,            this._tryAssumeStateOf
            );
        }
        else if( promise.isFulfilled() ) {
            if( mustAsync === true )
                async.invoke( this._resolveFulfill, this, promise._resolvedValue );
            else
                this._resolveFulfill( promise._resolvedValue );
        }
        else {
            if( mustAsync === true )
                async.invoke( this._resolveReject, this, promise._resolvedValue );
            else
                this._resolveReject( promise._resolvedValue );
        }

        if( longStackTraces &&
            promise._traceParent == null ) {
            promise._traceParent = this;
        }
    };

    Promise.prototype._tryAssumeStateOf =
    function Promise$_tryAssumeStateOf( value, mustAsync ) {
        if( !isPromise( value ) ||
            this._isFollowingOrFulfilledOrRejected() ) return false;

        this._assumeStateOf( value, mustAsync );
        return true;
    };

    Promise.prototype._resetTrace = function Promise$_resetTrace( caller ) {
        if( longStackTraces ) {
            var context = this._peekContext();
            var isTopLevel = context === void 0;
            this._trace = new CapturedTrace(
                typeof caller === "function"
                ? caller
                : this._resetTrace,
                isTopLevel
            );
        }
    };

    Promise.prototype._setTrace = function Promise$_setTrace( caller, parent ) {
        if( longStackTraces ) {
            var context = this._peekContext();
            var isTopLevel = context === void 0;
            if( parent !== void 0 &&
                parent._traceParent === context ) {
                this._trace = parent._trace;
            }
            else {
                this._trace = new CapturedTrace(
                    typeof caller === "function"
                    ? caller
                    : this._setTrace,
                    isTopLevel
                );
            }
        }
        return this;
    };

    Promise.prototype._attachExtraTrace =
    function Promise$_attachExtraTrace( error ) {
        if( longStackTraces &&
            canAttach( error ) ) {
            var promise = this;
            var stack = error.stack;
            stack = typeof stack === "string"
                ? stack.split("\n") : [];
            var headerLineCount = 1;

            while( promise != null &&
                promise._trace != null ) {
                stack = CapturedTrace.combine(
                    stack,
                    promise._trace.stack.split( "\n" )
                );
                promise = promise._traceParent;
            }

            var max = Error.stackTraceLimit + headerLineCount;
            var len = stack.length;
            if( len  > max ) {
                stack.length = max;
            }
            if( stack.length <= headerLineCount ) {
                error.stack = "(No stack trace)";
            }
            else {
                error.stack = stack.join("\n");
            }
            error["__promiseHandled__"] =
                withStackAttached( error["__promiseHandled__"] );
        }
    };

    Promise.prototype._notifyUnhandledRejection =
    function Promise$_notifyUnhandledRejection( reason ) {
        if( !isHandled( reason["__promiseHandled__"] ) ) {
            reason["__promiseHandled__"] =
                withHandledMarked( reason["__promiseHandled__"] );
            CapturedTrace.possiblyUnhandledRejection( reason, this );
        }
    };

    Promise.prototype._unhandledRejection =
    function Promise$_unhandledRejection( reason ) {
        if( !isHandled( reason["__promiseHandled__"] ) ) {
            async.invokeLater( this._notifyUnhandledRejection, this, reason );
        }
    };

    Promise.prototype._cleanValues = function Promise$_cleanValues() {
        this._cancellationParent = void 0;
    };

    Promise.prototype._fulfill = function Promise$_fulfill( value ) {
        if( this._isFollowingOrFulfilledOrRejected() ) return;
        this._resolveFulfill( value );

    };

    Promise.prototype._reject = function Promise$_reject( reason ) {
        if( this._isFollowingOrFulfilledOrRejected() ) return;
        this._resolveReject( reason );
    };

    Promise.prototype._doResolveAt = function Promise$_doResolveAt( i ) {
        var fn = this.isFulfilled()
            ? this._fulfillAt( i )
            : this._rejectAt( i );
        var value = this._resolvedValue;
        var receiver = this._receiverAt( i );
        var promise = this._promiseAt( i );
        this._unsetAt( i );
        this._resolvePromise( fn, receiver, value, promise );
    };

    Promise.prototype._resolveFulfill = function Promise$_resolveFulfill( value ) {
        this._cleanValues();
        this._setFulfilled();
        this._resolvedValue = value;
        var len = this._length();
        this._setLength( 0 );
        for( var i = 0; i < len; i+= 5 ) {
            if( this._fulfillAt( i ) !== void 0 ) {
                async.invoke( this._doResolveAt, this, i );
            }
            else {
                var promise = this._promiseAt( i );
                this._unsetAt( i );
                async.invoke( promise._fulfill, promise, value );
            }
        }

    };

    Promise.prototype._resolveLast = function Promise$_resolveLast( index ) {
        this._setLength( 0 );
        var fn;
        if( this.isFulfilled() ) {
            fn = this._fulfillAt( index );
        }
        else {
            fn = this._rejectAt( index );
        }

        if( fn !== void 0 ) {
            async.invoke( this._doResolveAt, this, index );
        }
        else {
            var promise = this._promiseAt( index );
            var value = this._resolvedValue;
            this._unsetAt( index );
            if( this.isFulfilled() ) {
                async.invoke( promise._fulfill, promise, value );
            }
            else {
                async.invoke( promise._reject, promise, value );
            }
        }

    };

    Promise.prototype._resolveReject = function Promise$_resolveReject( reason ) {
        this._cleanValues();
        this._setRejected();
        this._resolvedValue = reason;
        if( this._isFinal() ) {
            async.invokeLater( thrower, void 0, reason );
            return;
        }
        var len = this._length();
        this._setLength( 0 );
        var rejectionWasHandled = false;
        for( var i = 0; i < len; i+= 5 ) {
            if( this._rejectAt( i ) !== void 0 ) {
                rejectionWasHandled = true;
                async.invoke( this._doResolveAt, this, i );
            }
            else {
                var promise = this._promiseAt( i );
                this._unsetAt( i );
                if( !rejectionWasHandled )
                    rejectionWasHandled = promise._length() > 0;
                async.invoke( promise._reject, promise, reason );
            }
        }

        if( !rejectionWasHandled &&
            CapturedTrace.possiblyUnhandledRejection !== void 0
        ) {

            if( isObject( reason ) ) {
                var handledState = reason["__promiseHandled__"];
                var newReason = reason;

                if( handledState === void 0 ) {
                    newReason = ensurePropertyExpansion(reason,
                        "__promiseHandled__", 0 );
                    handledState = 0;
                }
                else if( isHandled( handledState ) ) {
                    return;
                }

                if( !isStackAttached( handledState ) )  {
                    this._attachExtraTrace( newReason );
                }
                async.invoke( this._unhandledRejection, this, newReason );

            }
        }

    };

    var contextStack = [];
    Promise.prototype._peekContext = function Promise$_peekContext() {
        var lastIndex = contextStack.length - 1;
        if( lastIndex >= 0 ) {
            return contextStack[ lastIndex ];
        }
        return void 0;

    };

    Promise.prototype._pushContext = function Promise$_pushContext() {
        if( !longStackTraces ) return;
        contextStack.push( this );
    };

    Promise.prototype._popContext = function Promise$_popContext() {
        if( !longStackTraces ) return;
        contextStack.pop();
    };


    function Promise$_All( promises, PromiseArray, caller, boundTo ) {
        if( isPromise( promises ) ||
            isArray( promises ) ) {

            return new PromiseArray(
                promises,
                typeof caller === "function"
                    ? caller
                    : Promise$_All,
                boundTo
            );
        }
        return new PromiseArray(
            [ apiRejection( "expecting an array or a promise" ) ],
            caller,
            boundTo
        );
    }

    var old = global.Promise;

    Promise.noConflict = function() {
        if( global.Promise === Promise ) {
            global.Promise = old;
        }
        return Promise;
    };

    if( !CapturedTrace.isSupported() ) {
        Promise.longStackTraces = function(){};
        longStackTraces = false;
    }

    Promise.CancellationError = CancellationError;
    Promise.TimeoutError = TimeoutError;
    Promise.TypeError = TypeError;
    Promise.RejectionError = RejectionError;
    require('./synchronous_inspection.js')(Promise);
    require('./any.js')(Promise,Promise$_All,PromiseArray);
    require('./race.js')(Promise,Promise$_All,PromiseArray);
    require('./call_get.js')(Promise);
    require('./filter.js')(Promise,Promise$_All,PromiseArray,apiRejection);
    require('./generators.js')(Promise,apiRejection);
    require('./map.js')(Promise,Promise$_All,PromiseArray,apiRejection);
    require('./nodeify.js')(Promise);
    require('./promisify.js')(Promise);
    require('./props.js')(Promise,PromiseArray);
    require('./reduce.js')(Promise,Promise$_All,PromiseArray,apiRejection);
    require('./settle.js')(Promise,Promise$_All,PromiseArray);
    require('./some.js')(Promise,Promise$_All,PromiseArray,apiRejection);
    require('./progress.js')(Promise);
    require('./cancel.js')(Promise);
    require('./complex_thenables.js')(Promise);

    Promise.prototype = Promise.prototype;
    return Promise;

    };

    },{"./any.js":1,"./assert.js":2,"./async.js":3,"./call_get.js":5,"./cancel.js":6,"./captured_trace.js":7,"./catch_filter.js":8,"./complex_thenables.js":9,"./errors.js":10,"./errors_api_rejection":11,"./filter.js":12,"./generators.js":13,"./global.js":14,"./map.js":15,"./nodeify.js":16,"./progress.js":17,"./promise_array.js":19,"./promise_resolver.js":21,"./promisify.js":23,"./props.js":25,"./race.js":27,"./reduce.js":29,"./settle.js":31,"./some.js":33,"./synchronous_inspection.js":35,"./util.js":36}],19:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
    var ASSERT = require("./assert.js");
    var ensureNotHandled = require( "./errors.js").ensureNotHandled;
    var util = require("./util.js");
    var async = require( "./async.js");
    var hasOwn = {}.hasOwnProperty;
    var isArray = util.isArray;

    function toFulfillmentValue( val ) {
        switch( val ) {
        case 0: return void 0;
        case 1: return [];
        case 2: return {};
        }
    }

    function PromiseArray( values, caller, boundTo ) {
        this._values = values;
        this._resolver = Promise.pending( caller );
        if( boundTo !== void 0 ) {
            this._resolver.promise._setBoundTo( boundTo );
        }
        this._length = 0;
        this._totalResolved = 0;
        this._init( void 0, 1 );
    }
    PromiseArray.PropertiesPromiseArray = function() {};

    PromiseArray.prototype.length = function PromiseArray$length() {
        return this._length;
    };

    PromiseArray.prototype.promise = function PromiseArray$promise() {
        return this._resolver.promise;
    };

    PromiseArray.prototype._init =
    function PromiseArray$_init( _, fulfillValueIfEmpty ) {
        var values = this._values;
        if( Promise.is( values ) ) {
            if( values.isFulfilled() ) {
                values = values._resolvedValue;
                if( !isArray( values ) ) {
                    this._fulfill( toFulfillmentValue( fulfillValueIfEmpty ) );
                    return;
                }
                this._values = values;
            }
            else if( values.isPending() ) {
                values._then(
                    this._init,
                    this._reject,
                    void 0,
                    this,
                    fulfillValueIfEmpty,
                    this.constructor
                );
                return;
            }
            else {
                this._reject( values._resolvedValue );
                return;
            }
        }
        if( values.length === 0 ) {
            this._fulfill( toFulfillmentValue( fulfillValueIfEmpty ) );
            return;
        }
        var len = values.length;
        var newLen = len;
        var newValues;
        if( this instanceof PromiseArray.PropertiesPromiseArray ) {
            newValues = this._values;
        }
        else {
            newValues = new Array( len );
        }
        var isDirectScanNeeded = false;
        for( var i = 0; i < len; ++i ) {
            var promise = values[i];
            if( promise === void 0 && !hasOwn.call( values, i ) ) {
                newLen--;
                continue;
            }
            var maybePromise = Promise._cast( promise );
            if( maybePromise instanceof Promise &&
                maybePromise.isPending() ) {
                maybePromise._then(
                    this._promiseFulfilled,
                    this._promiseRejected,
                    this._promiseProgressed,

                    this,                i,                 this._scanDirectValues
                );
            }
            else {
                isDirectScanNeeded = true;
            }
            newValues[i] = maybePromise;
        }
        if( newLen === 0 ) {
            if( fulfillValueIfEmpty === 1 ) {
                this._fulfill( newValues );
            }
            else {
                this._fulfill( toFulfillmentValue( fulfillValueIfEmpty ) );
            }
            return;
        }
        this._values = newValues;
        this._length = newLen;
        if( isDirectScanNeeded ) {
            var scanMethod = newLen === len
                ? this._scanDirectValues
                : this._scanDirectValuesHoled;
            async.invoke( scanMethod, this, len );
        }
    };

    PromiseArray.prototype._resolvePromiseAt =
    function PromiseArray$_resolvePromiseAt( i ) {
        var value = this._values[i];
        if( !Promise.is( value ) ) {
            this._promiseFulfilled( value, i );
        }
        else if( value.isFulfilled() ) {
            this._promiseFulfilled( value._resolvedValue, i );
        }
        else if( value.isRejected() ) {
            this._promiseRejected( value._resolvedValue, i );
        }
    };

    PromiseArray.prototype._scanDirectValuesHoled =
    function PromiseArray$_scanDirectValuesHoled( len ) {
        for( var i = 0; i < len; ++i ) {
            if( this._isResolved() ) {
                break;
            }
            if( hasOwn.call( this._values, i ) ) {
                this._resolvePromiseAt( i );
            }
        }
    };

    PromiseArray.prototype._scanDirectValues =
    function PromiseArray$_scanDirectValues( len ) {
        for( var i = 0; i < len; ++i ) {
            if( this._isResolved() ) {
                break;
            }
            this._resolvePromiseAt( i );
        }
    };

    PromiseArray.prototype._isResolved = function PromiseArray$_isResolved() {
        return this._values === null;
    };

    PromiseArray.prototype._fulfill = function PromiseArray$_fulfill( value ) {
        this._values = null;
        this._resolver.fulfill( value );
    };

    PromiseArray.prototype._reject = function PromiseArray$_reject( reason ) {
        ensureNotHandled( reason );
        this._values = null;
        this._resolver.reject( reason );
    };

    PromiseArray.prototype._promiseProgressed =
    function PromiseArray$_promiseProgressed( progressValue, index ) {
        if( this._isResolved() ) return;
        this._resolver.progress({
            index: index,
            value: progressValue
        });
    };

    PromiseArray.prototype._promiseFulfilled =
    function PromiseArray$_promiseFulfilled( value, index ) {
        if( this._isResolved() ) return;
        this._values[ index ] = value;
        var totalResolved = ++this._totalResolved;
        if( totalResolved >= this._length ) {
            this._fulfill( this._values );
        }
    };

    PromiseArray.prototype._promiseRejected =
    function PromiseArray$_promiseRejected( reason ) {
        if( this._isResolved() ) return;
        this._totalResolved++;
        this._reject( reason );
    };

    return PromiseArray;
    };

    },{"./assert.js":2,"./async.js":3,"./errors.js":10,"./util.js":36}],20:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var TypeError = require( "./errors.js" ).TypeError;

    function PromiseInspection( promise ) {
        if( promise !== void 0 ) {
            this._bitField = promise._bitField;
            this._resolvedValue = promise.isResolved()
                ? promise._resolvedValue
                : void 0;
        }
        else {
            this._bitField = 0;
            this._resolvedValue = void 0;
        }
    }
    PromiseInspection.prototype.isFulfilled =
    function PromiseInspection$isFulfilled() {
        return ( this._bitField & 268435456 ) > 0;
    };

    PromiseInspection.prototype.isRejected =
    function PromiseInspection$isRejected() {
        return ( this._bitField & 134217728 ) > 0;
    };

    PromiseInspection.prototype.isPending = function PromiseInspection$isPending() {
        return ( this._bitField & 402653184 ) === 0;
    };

    PromiseInspection.prototype.value = function PromiseInspection$value() {
        if( !this.isFulfilled() ) {
            throw new TypeError(
                "cannot get fulfillment value of a non-fulfilled promise");
        }
        return this._resolvedValue;
    };

    PromiseInspection.prototype.error = function PromiseInspection$error() {
        if( !this.isRejected() ) {
            throw new TypeError(
                "cannot get rejection reason of a non-rejected promise");
        }
        return this._resolvedValue;
    };

    module.exports = PromiseInspection;

    },{"./errors.js":10}],21:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var util = require( "./util.js" );
    var maybeWrapAsError = util.maybeWrapAsError;
    var errors = require( "./errors.js");
    var TimeoutError = errors.TimeoutError;
    var RejectionError = errors.RejectionError;
    var async = require( "./async.js" );
    var haveGetters = util.haveGetters;

    function isUntypedError( obj ) {
        return obj instanceof Error &&
            Object.getPrototypeOf( obj ) === Error.prototype;
    }

    function wrapAsRejectionError( obj ) {
        if( isUntypedError( obj ) ) {
            return new RejectionError( obj );
        }
        return obj;
    }

    function nodebackForResolver( resolver ) {
        function PromiseResolver$_callback( err, value ) {
            if( err ) {
                resolver.reject( wrapAsRejectionError( maybeWrapAsError( err ) ) );
            }
            else {
                if( arguments.length > 2 ) {
                    var $_len = arguments.length;var args = new Array($_len - 1); for(var $_i = 1; $_i < $_len; ++$_i) {args[$_i - 1] = arguments[$_i];}
                    resolver.fulfill( args );
                }
                else {
                    resolver.fulfill( value );
                }
            }
        }
        return PromiseResolver$_callback;
    }


    var PromiseResolver;
    if( !haveGetters ) {
        PromiseResolver = function PromiseResolver( promise ) {
            this.promise = promise;
            this.asCallback = nodebackForResolver( this );
        };
    }
    else {
        PromiseResolver = function PromiseResolver( promise ) {
            this.promise = promise;
        };
    }
    if( haveGetters ) {
        Object.defineProperty( PromiseResolver.prototype, "asCallback", {
            get: function() {
                return nodebackForResolver( this );
            }
        });
    }

    PromiseResolver._nodebackForResolver = nodebackForResolver;

    PromiseResolver.prototype.toString = function PromiseResolver$toString() {
        return "[object PromiseResolver]";
    };

    PromiseResolver.prototype.fulfill = function PromiseResolver$fulfill( value ) {
        if( this.promise._tryAssumeStateOf( value, false ) ) {
            return;
        }
        async.invoke( this.promise._fulfill, this.promise, value );
    };

    PromiseResolver.prototype.reject = function PromiseResolver$reject( reason ) {
        this.promise._attachExtraTrace( reason );
        async.invoke( this.promise._reject, this.promise, reason );
    };

    PromiseResolver.prototype.progress =
    function PromiseResolver$progress( value ) {
        async.invoke( this.promise._progress, this.promise, value );
    };

    PromiseResolver.prototype.cancel = function PromiseResolver$cancel() {
        async.invoke( this.promise.cancel, this.promise, void 0 );
    };

    PromiseResolver.prototype.timeout = function PromiseResolver$timeout() {
        this.reject( new TimeoutError( "timeout" ) );
    };

    PromiseResolver.prototype.isResolved = function PromiseResolver$isResolved() {
        return this.promise.isResolved();
    };

    PromiseResolver.prototype.toJSON = function PromiseResolver$toJSON() {
        return this.promise.toJSON();
    };

    module.exports = PromiseResolver;

    },{"./async.js":3,"./errors.js":10,"./util.js":36}],22:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
    var errors = require( "./errors.js" );
    var TypeError = errors.TypeError;
    var ensureNotHandled = errors.ensureNotHandled;
    var util = require("./util.js");
    var isArray = util.isArray;
    var errorObj = util.errorObj;
    var tryCatch1 = util.tryCatch1;

    function PromiseSpawn( generatorFunction, receiver, caller ) {
        this._resolver = Promise.pending( caller );
        this._generatorFunction = generatorFunction;
        this._receiver = receiver;
        this._generator = void 0;
    }

    PromiseSpawn.prototype.promise = function PromiseSpawn$promise() {
        return this._resolver.promise;
    };

    PromiseSpawn.prototype._run = function PromiseSpawn$_run() {
        this._generator = this._generatorFunction.call( this._receiver );
        this._receiver =
            this._generatorFunction = void 0;
        this._next( void 0 );
    };

    PromiseSpawn.prototype._continue = function PromiseSpawn$_continue( result ) {
        if( result === errorObj ) {
            this._generator = void 0;
            this._resolver.reject( result.e );
            return;
        }

        var value = result.value;
        if( result.done === true ) {
            this._generator = void 0;
            this._resolver.fulfill( value );
        }
        else {
            var maybePromise = Promise._cast( value, PromiseSpawn$_continue );
            if( !( maybePromise instanceof Promise ) ) {
                if( isArray( maybePromise ) ) {
                    maybePromise = Promise.all( maybePromise );
                }
                else {
                    this._throw( new TypeError(
                        "A value was yielded that could not be treated as a promise"
                    ) );
                    return;
                }
            }
            maybePromise._then(
                this._next,
                this._throw,
                void 0,
                this,
                null,
                void 0
            );
        }
    };

    PromiseSpawn.prototype._throw = function PromiseSpawn$_throw( reason ) {
        ensureNotHandled( reason );
        this.promise()._attachExtraTrace( reason );
        this._continue(
            tryCatch1( this._generator["throw"], this._generator, reason )
        );
    };

    PromiseSpawn.prototype._next = function PromiseSpawn$_next( value ) {
        this._continue(
            tryCatch1( this._generator.next, this._generator, value )
        );
    };

    return PromiseSpawn;
    };

    },{"./errors.js":10,"./util.js":36}],23:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
    var THIS = {};
    var util = require( "./util.js");
    var errors = require( "./errors.js" );
    var nodebackForResolver = require( "./promise_resolver.js" )
        ._nodebackForResolver;
    var RejectionError = errors.RejectionError;
    var withAppended = util.withAppended;
    var maybeWrapAsError = util.maybeWrapAsError;
    var canEvaluate = util.canEvaluate;
    var notEnumerableProp = util.notEnumerableProp;
    var deprecated = util.deprecated;
    var ASSERT = require( "./assert.js" );

    Promise.prototype.error = function Promise$_error( fn ) {
        return this.caught( RejectionError, fn );
    };

    function makeNodePromisifiedEval( callback, receiver, originalName ) {
        function getCall(count) {
            var args = new Array(count);
            for( var i = 0, len = args.length; i < len; ++i ) {
                args[i] = "a" + (i+1);
            }
            var comma = count > 0 ? "," : "";

            if( typeof callback === "string" &&
                receiver === THIS ) {
                return "this['" + callback + "']("+args.join(",") +
                    comma +" fn);"+
                    "break;";
            }
            return ( receiver === void 0
                ? "callback("+args.join(",")+ comma +" fn);"
                : "callback.call("+( receiver === THIS
                    ? "this"
                    : "receiver" )+", "+args.join(",") + comma + " fn);" ) +
            "break;";
        }

        function getArgs() {
            return "var args = new Array( len + 1 );" +
            "var i = 0;" +
            "for( var i = 0; i < len; ++i ) { " +
            "   args[i] = arguments[i];" +
            "}" +
            "args[i] = fn;";
        }

        var callbackName = ( typeof originalName === "string" ?
            originalName + "Async" :
            "promisified" );

        return new Function("Promise", "callback", "receiver",
                "withAppended", "maybeWrapAsError", "nodebackForResolver",
            "var ret = function " + callbackName +
            "( a1, a2, a3, a4, a5 ) {\"use strict\";" +
            "var len = arguments.length;" +
            "var resolver = Promise.pending( " + callbackName + " );" +
            "var fn = nodebackForResolver( resolver );"+
            "try{" +
            "switch( len ) {" +
            "case 1:" + getCall(1) +
            "case 2:" + getCall(2) +
            "case 3:" + getCall(3) +
            "case 0:" + getCall(0) +
            "case 4:" + getCall(4) +
            "case 5:" + getCall(5) +
            "default: " + getArgs() + (typeof callback === "string"
                ? "this['" + callback + "'].apply("
                : "callback.apply("
            ) +
                ( receiver === THIS ? "this" : "receiver" ) +
            ", args ); break;" +
            "}" +
            "}" +
            "catch(e){ " +
            "" +
            "resolver.reject( maybeWrapAsError( e ) );" +
            "}" +
            "return resolver.promise;" +
            "" +
            "}; ret.__isPromisified__ = true; return ret;"
        )(Promise, callback, receiver, withAppended,
            maybeWrapAsError, nodebackForResolver);
    }

    function makeNodePromisifiedClosure( callback, receiver ) {
        function promisified() {
            var _receiver = receiver;
            if( receiver === THIS ) _receiver = this;
            if( typeof callback === "string" ) {
                callback = _receiver[callback];
            }
            var resolver = Promise.pending( promisified );
            var fn = nodebackForResolver( resolver );
            try {
                callback.apply( _receiver, withAppended( arguments, fn ) );
            }
            catch(e) {
                resolver.reject( maybeWrapAsError( e ) );
            }
            return resolver.promise;
        }
        promisified.__isPromisified__ = true;
        return promisified;
    }

    var makeNodePromisified = canEvaluate
        ? makeNodePromisifiedEval
        : makeNodePromisifiedClosure;

    function f(){}
    function isPromisified( fn ) {
        return fn.__isPromisified__ === true;
    }
    var hasProp = {}.hasOwnProperty;
    var roriginal = new RegExp( "__beforePromisified__" + "$" );
    function _promisify( callback, receiver, isAll ) {
        if( isAll ) {
            var changed = 0;
            var o = {};
            for( var key in callback ) {
                if( !roriginal.test( key ) &&
                    !hasProp.call( callback,
                        ( key + "__beforePromisified__" ) ) &&
                    typeof callback[ key ] === "function" ) {
                    var fn = callback[key];
                    if( !isPromisified( fn ) ) {
                        changed++;
                        var originalKey = key + "__beforePromisified__";
                        var promisifiedKey = key + "Async";
                        notEnumerableProp( callback, originalKey, fn );
                        o[ promisifiedKey ] =
                            makeNodePromisified( originalKey, THIS, key );
                    }
                }
            }
            if( changed > 0 ) {
                for( var key in o ) {
                    if( hasProp.call( o, key ) ) {
                        callback[key] = o[key];
                    }
                }
                f.prototype = callback;
            }

            return callback;
        }
        else {
            return makeNodePromisified( callback, receiver, void 0 );
        }
    }

    Promise.promisify = function Promise$Promisify( callback, receiver ) {
        if( typeof callback === "object" && callback !== null ) {
            deprecated( "Promise.promisify for promisifying entire objects " +
                "is deprecated. Use Promise.promisifyAll instead." );
            return _promisify( callback, receiver, true );
        }
        if( typeof callback !== "function" ) {
            throw new TypeError( "callback must be a function" );
        }
        if( isPromisified( callback ) ) {
            return callback;
        }
        return _promisify(
            callback,
            arguments.length < 2 ? THIS : receiver,
            false );
    };

    Promise.promisifyAll = function Promise$PromisifyAll( target ) {
        if( typeof target !== "function" && typeof target !== "object" ) {
            throw new TypeError( "Cannot promisify " + typeof target );
        }
        return _promisify( target, void 0, true );
    };
    };


    },{"./assert.js":2,"./errors.js":10,"./promise_resolver.js":21,"./util.js":36}],24:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function(Promise, PromiseArray) {
    var ASSERT = require("./assert.js");
    var util = require("./util.js");
    var inherits = util.inherits;

    function PropertiesPromiseArray( obj, caller, boundTo ) {
        var keys = Object.keys( obj );
        var values = new Array( keys.length );
        for( var i = 0, len = values.length; i < len; ++i ) {
            values[i] = obj[keys[i]];
        }
        this.constructor$( values, caller, boundTo );
        if( !this._isResolved() ) {
            for( var i = 0, len = keys.length; i < len; ++i ) {
                values.push( keys[i] );
            }
        }
    }
    inherits( PropertiesPromiseArray, PromiseArray );

    PropertiesPromiseArray.prototype._init =
    function PropertiesPromiseArray$_init() {
        this._init$( void 0, 2 ) ;
    };

    PropertiesPromiseArray.prototype._promiseFulfilled =
    function PropertiesPromiseArray$_promiseFulfilled( value, index ) {
        if( this._isResolved() ) return;
        this._values[ index ] = value;
        var totalResolved = ++this._totalResolved;
        if( totalResolved >= this._length ) {
            var val = {};
            var keyOffset = this.length();
            for( var i = 0, len = this.length(); i < len; ++i ) {
                val[this._values[i + keyOffset]] = this._values[i];
            }
            this._fulfill( val );
        }
    };

    PropertiesPromiseArray.prototype._promiseProgressed =
    function PropertiesPromiseArray$_promiseProgressed( value, index ) {
        if( this._isResolved() ) return;

        this._resolver.progress({
            key: this._values[ index + this.length() ],
            value: value
        });
    };

    PromiseArray.PropertiesPromiseArray = PropertiesPromiseArray;

    return PropertiesPromiseArray;
    };
    },{"./assert.js":2,"./util.js":36}],25:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, PromiseArray ) {
        var PropertiesPromiseArray = require("./properties_promise_array.js")(
            Promise, PromiseArray);
        var util = require( "./util.js" );
        var isPrimitive = util.isPrimitive;

        function Promise$_Props( promises, useBound, caller ) {
            var ret;
            if( isPrimitive( promises ) ) {
                ret = Promise.fulfilled( promises, caller );
            }
            else if( Promise.is( promises ) ) {
                ret = promises._then( Promise.props, void 0, void 0,
                                void 0, void 0, caller );
            }
            else {
                ret = new PropertiesPromiseArray(
                    promises,
                    caller,
                    useBound === true ? promises._boundTo : void 0
                ).promise();
                useBound = false;
            }
            if( useBound === true ) {
                ret._boundTo = promises._boundTo;
            }
            return ret;
        }

        Promise.prototype.props = function Promise$props() {
            return Promise$_Props( this, true, this.props );
        };

        Promise.props = function Promise$Props( promises ) {
            return Promise$_Props( promises, false, Promise.props );
        };
    };
    },{"./properties_promise_array.js":24,"./util.js":36}],26:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var ASSERT = require("./assert.js");
    function arrayCopy( src, srcIndex, dst, dstIndex, len ) {
        for( var j = 0; j < len; ++j ) {
            dst[ j + dstIndex ] = src[ j + srcIndex ];
        }
    }

    function pow2AtLeast( n ) {
        n = n >>> 0;
        n = n - 1;
        n = n | (n >> 1);
        n = n | (n >> 2);
        n = n | (n >> 4);
        n = n | (n >> 8);
        n = n | (n >> 16);
        return n + 1;
    }

    function getCapacity( capacity ) {
        if( typeof capacity !== "number" ) return 16;
        return pow2AtLeast(
            Math.min(
                Math.max( 16, capacity ), 1073741824 )
        );
    }

    function Queue( capacity ) {
        this._capacity = getCapacity( capacity );
        this._length = 0;
        this._front = 0;
        this._makeCapacity();
    }

    Queue.prototype._willBeOverCapacity =
    function Queue$_willBeOverCapacity( size ) {
        return this._capacity < size;
    };

    Queue.prototype._pushOne = function Queue$_pushOne( arg ) {
        var length = this.length();
        this._checkCapacity( length + 1 );
        var i = ( this._front + length ) & ( this._capacity - 1 );
        this[i] = arg;
        this._length = length + 1;
    };

    Queue.prototype.push = function Queue$push( fn, receiver, arg ) {
        var length = this.length() + 3;
        if( this._willBeOverCapacity( length ) ) {
            this._pushOne( fn );
            this._pushOne( receiver );
            this._pushOne( arg );
            return;
        }
        var j = this._front + length - 3;
        this._checkCapacity( length );
        var wrapMask = this._capacity - 1;
        this[ ( j + 0 ) & wrapMask ] = fn;
        this[ ( j + 1 ) & wrapMask ] = receiver;
        this[ ( j + 2 ) & wrapMask ] = arg;
        this._length = length;
    };

    Queue.prototype.shift = function Queue$shift() {
        var front = this._front,
            ret = this[ front ];

        this[ front ] = void 0;
        this._front = ( front + 1 ) & ( this._capacity - 1 );
        this._length--;
        return ret;
    };

    Queue.prototype.length = function Queue$length() {
        return this._length;
    };

    Queue.prototype._makeCapacity = function Queue$_makeCapacity() {
        var len = this._capacity;
        for( var i = 0; i < len; ++i ) {
            this[i] = void 0;
        }
    };

    Queue.prototype._checkCapacity = function Queue$_checkCapacity( size ) {
        if( this._capacity < size ) {
            this._resizeTo( this._capacity << 3 );
        }
    };

    Queue.prototype._resizeTo = function Queue$_resizeTo( capacity ) {
        var oldFront = this._front;
        var oldCapacity = this._capacity;
        var oldQueue = new Array( oldCapacity );
        var length = this.length();

        arrayCopy( this, 0, oldQueue, 0, oldCapacity );
        this._capacity = capacity;
        this._makeCapacity();
        this._front = 0;
        if( oldFront + length <= oldCapacity ) {
            arrayCopy( oldQueue, oldFront, this, 0, length );
        }
        else {        var lengthBeforeWrapping =
                length - ( ( oldFront + length ) & ( oldCapacity - 1 ) );

            arrayCopy( oldQueue, oldFront, this, 0, lengthBeforeWrapping );
            arrayCopy( oldQueue, 0, this, lengthBeforeWrapping,
                        length - lengthBeforeWrapping );
        }
    };

    module.exports = Queue;

    },{"./assert.js":2}],27:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, Promise$_All, PromiseArray ) {

        var RacePromiseArray =
            require( "./race_promise_array.js" )(Promise, PromiseArray);

        function Promise$_Race( promises, useBound, caller ) {
            return Promise$_All(
                promises,
                RacePromiseArray,
                caller,
                useBound === true ? promises._boundTo : void 0
            ).promise();
        }

        Promise.race = function Promise$Race( promises ) {
            return Promise$_Race( promises, false, Promise.race );
        };

        Promise.prototype.race = function Promise$race() {
            return Promise$_Race( this, true, this.race );
        };

    };

    },{"./race_promise_array.js":28}],28:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, PromiseArray ) {
    var util = require("./util.js");
    var inherits = util.inherits;
    function RacePromiseArray( values, caller, boundTo ) {
        this.constructor$( values, caller, boundTo );
    }
    inherits( RacePromiseArray, PromiseArray );

    RacePromiseArray.prototype._init =
    function RacePromiseArray$_init() {
        this._init$( void 0, 0 );
    };

    RacePromiseArray.prototype._promiseFulfilled =
    function RacePromiseArray$_promiseFulfilled( value ) {
        if( this._isResolved() ) return;
        this._fulfill( value );

    };
    RacePromiseArray.prototype._promiseRejected =
    function RacePromiseArray$_promiseRejected( reason ) {
        if( this._isResolved() ) return;
        this._reject( reason );
    };

    return RacePromiseArray;
    };

    },{"./util.js":36}],29:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, Promise$_All, PromiseArray, apiRejection ) {

        var ASSERT = require( "./assert.js" );

        function Promise$_reducer( fulfilleds, initialValue ) {
            var fn = this;
            var receiver = void 0;
            if( typeof fn !== "function" )  {
                receiver = fn.receiver;
                fn = fn.fn;
            }
            var len = fulfilleds.length;
            var accum = void 0;
            var startIndex = 0;

            if( initialValue !== void 0 ) {
                accum = initialValue;
                startIndex = 0;
            }
            else {
                startIndex = 1;
                if( len > 0 ) {
                    for( var i = 0; i < len; ++i ) {
                        if( fulfilleds[i] === void 0 &&
                            !(i in fulfilleds) ) {
                            continue;
                        }
                        accum = fulfilleds[i];
                        startIndex = i + 1;
                        break;
                    }
                }
            }
            if( receiver === void 0 ) {
                for( var i = startIndex; i < len; ++i ) {
                    if( fulfilleds[i] === void 0 &&
                        !(i in fulfilleds) ) {
                        continue;
                    }
                    accum = fn( accum, fulfilleds[i], i, len );
                }
            }
            else {
                for( var i = startIndex; i < len; ++i ) {
                    if( fulfilleds[i] === void 0 &&
                        !(i in fulfilleds) ) {
                        continue;
                    }
                    accum = fn.call( receiver, accum, fulfilleds[i], i, len );
                }
            }
            return accum;
        }

        function Promise$_unpackReducer( fulfilleds ) {
            var fn = this.fn;
            var initialValue = this.initialValue;
            return Promise$_reducer.call( fn, fulfilleds, initialValue );
        }

        function Promise$_slowReduce(
            promises, fn, initialValue, useBound, caller ) {
            return initialValue._then( function callee( initialValue ) {
                return Promise$_Reduce(
                    promises, fn, initialValue, useBound, callee );
            }, void 0, void 0, void 0, void 0, caller);
        }

        function Promise$_Reduce( promises, fn, initialValue, useBound, caller ) {
            if( typeof fn !== "function" ) {
                return apiRejection( "fn is not a function" );
            }

            if( useBound === true ) {
                fn = {
                    fn: fn,
                    receiver: promises._boundTo
                };
            }

            if( initialValue !== void 0 ) {
                if( Promise.is( initialValue ) ) {
                    if( initialValue.isFulfilled() ) {
                        initialValue = initialValue._resolvedValue;
                    }
                    else {
                        return Promise$_slowReduce( promises,
                            fn, initialValue, useBound, caller );
                    }
                }

                return Promise$_All( promises, PromiseArray, caller,
                    useBound === true ? promises._boundTo : void 0 )
                    .promise()
                    ._then( Promise$_unpackReducer, void 0, void 0, {
                        fn: fn,
                        initialValue: initialValue
                    }, void 0, Promise.reduce );
            }
            return Promise$_All( promises, PromiseArray, caller,
                    useBound === true ? promises._boundTo : void 0 ).promise()
                ._then( Promise$_reducer, void 0, void 0, fn, void 0, caller );
        }


        Promise.reduce = function Promise$Reduce( promises, fn, initialValue ) {
            return Promise$_Reduce( promises, fn,
                initialValue, false, Promise.reduce);
        };

        Promise.prototype.reduce = function Promise$reduce( fn, initialValue ) {
            return Promise$_Reduce( this, fn, initialValue,
                                    true, this.reduce );
        };
    };

    },{"./assert.js":2}],30:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var global = require("./global.js");
    var ASSERT = require("./assert.js");
    var schedule;
    if( typeof process !== "undefined" && process !== null &&
        typeof process.cwd === "function" ) {
        if( typeof global.setImmediate !== "undefined" ) {
            schedule = function Promise$_Scheduler( fn ) {
                global.setImmediate( fn );
            };
        }
        else {
            schedule = function Promise$_Scheduler( fn ) {
                process.nextTick( fn );
            };
        }
    }
    else if( ( typeof MutationObserver === "function" ||
            typeof WebkitMutationObserver === "function" ||
            typeof WebKitMutationObserver === "function" ) &&
            typeof document !== "undefined" &&
            typeof document.createElement === "function" ) {


        schedule = (function(){
            var MutationObserver = global.MutationObserver ||
                global.WebkitMutationObserver ||
                global.WebKitMutationObserver;
            var div = document.createElement("div");
            var queuedFn = void 0;
            var observer = new MutationObserver(
                function Promise$_Scheduler() {
                    var fn = queuedFn;
                    queuedFn = void 0;
                    fn();
                }
            );
            var cur = true;
            observer.observe( div, {
                attributes: true,
                childList: true,
                characterData: true
            });
            return function Promise$_Scheduler( fn ) {
                queuedFn = fn;
                cur = !cur;
                div.setAttribute( "class", cur ? "foo" : "bar" );
            };

        })();
    }
    else if ( typeof global.postMessage === "function" &&
        typeof global.importScripts !== "function" &&
        typeof global.addEventListener === "function" &&
        typeof global.removeEventListener === "function" ) {

        var MESSAGE_KEY = "bluebird_message_key_" + Math.random();
        schedule = (function(){
            var queuedFn = void 0;

            function Promise$_Scheduler(e) {
                if(e.source === global &&
                    e.data === MESSAGE_KEY) {
                    var fn = queuedFn;
                    queuedFn = void 0;
                    fn();
                }
            }

            global.addEventListener( "message", Promise$_Scheduler, false );

            return function Promise$_Scheduler( fn ) {
                queuedFn = fn;
                global.postMessage(
                    MESSAGE_KEY, "*"
                );
            };

        })();
    }
    else if( typeof MessageChannel === "function" ) {
        schedule = (function(){
            var queuedFn = void 0;

            var channel = new MessageChannel();
            channel.port1.onmessage = function Promise$_Scheduler() {
                    var fn = queuedFn;
                    queuedFn = void 0;
                    fn();
            };

            return function Promise$_Scheduler( fn ) {
                queuedFn = fn;
                channel.port2.postMessage( null );
            };
        })();
    }
    else if( global.setTimeout ) {
        schedule = function Promise$_Scheduler( fn ) {
            setTimeout( fn, 4 );
        };
    }
    else {
        schedule = function Promise$_Scheduler( fn ) {
            fn();
        };
    }

    module.exports = schedule;

    },{"./assert.js":2,"./global.js":14}],31:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, Promise$_All, PromiseArray ) {

        var SettledPromiseArray = require( "./settled_promise_array.js" )(
            Promise, PromiseArray);

        function Promise$_Settle( promises, useBound, caller ) {
            return Promise$_All(
                promises,
                SettledPromiseArray,
                caller,
                useBound === true ? promises._boundTo : void 0
            ).promise();
        }

        Promise.settle = function Promise$Settle( promises ) {
            return Promise$_Settle( promises, false, Promise.settle );
        };

        Promise.prototype.settle = function Promise$settle() {
            return Promise$_Settle( this, true, this.settle );
        };

    };
    },{"./settled_promise_array.js":32}],32:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, PromiseArray ) {
    var ASSERT = require("./assert.js");
    var PromiseInspection = require( "./promise_inspection.js" );
    var util = require("./util.js");
    var inherits = util.inherits;
    function SettledPromiseArray( values, caller, boundTo ) {
        this.constructor$( values, caller, boundTo );
    }
    inherits( SettledPromiseArray, PromiseArray );

    SettledPromiseArray.prototype._promiseResolved =
    function SettledPromiseArray$_promiseResolved( index, inspection ) {
        this._values[ index ] = inspection;
        var totalResolved = ++this._totalResolved;
        if( totalResolved >= this._length ) {
            this._fulfill( this._values );
        }
    };

    SettledPromiseArray.prototype._promiseFulfilled =
    function SettledPromiseArray$_promiseFulfilled( value, index ) {
        if( this._isResolved() ) return;
        var ret = new PromiseInspection();
        ret._bitField = 268435456;
        ret._resolvedValue = value;
        this._promiseResolved( index, ret );
    };
    SettledPromiseArray.prototype._promiseRejected =
    function SettledPromiseArray$_promiseRejected( reason, index ) {
        if( this._isResolved() ) return;
        var ret = new PromiseInspection();
        ret._bitField = 134217728;
        ret._resolvedValue = reason;
        this._promiseResolved( index, ret );
    };

    return SettledPromiseArray;
    };
    },{"./assert.js":2,"./promise_inspection.js":20,"./util.js":36}],33:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise, Promise$_All, PromiseArray, apiRejection ) {

        var SomePromiseArray = require( "./some_promise_array.js" )(PromiseArray);
        var ASSERT = require( "./assert.js" );

        function Promise$_Some( promises, howMany, useBound, caller ) {
            if( ( howMany | 0 ) !== howMany ) {
                return apiRejection("howMany must be an integer");
            }
            var ret = Promise$_All(
                promises,
                SomePromiseArray,
                caller,
                useBound === true ? promises._boundTo : void 0
            );
            ret.setHowMany( howMany );
            return ret.promise();
        }

        Promise.some = function Promise$Some( promises, howMany ) {
            return Promise$_Some( promises, howMany, false, Promise.some );
        };

        Promise.prototype.some = function Promise$some( count ) {
            return Promise$_Some( this, count, true, this.some );
        };

    };
    },{"./assert.js":2,"./some_promise_array.js":34}],34:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function ( PromiseArray ) {
    var util = require("./util.js");
    var inherits = util.inherits;
    var isArray = util.isArray;

    function SomePromiseArray( values, caller, boundTo ) {
        this.constructor$( values, caller, boundTo );
        this._howMany = 0;
        this._unwrap = false;
    }
    inherits( SomePromiseArray, PromiseArray );

    SomePromiseArray.prototype._init = function SomePromiseArray$_init() {
        this._init$( void 0, 1 );
        var isArrayResolved = isArray( this._values );
        this._holes = isArrayResolved
            ? this._values.length - this.length()
            : 0;

        if( !this._isResolved() && isArrayResolved ) {
            this._howMany = Math.max(0, Math.min( this._howMany, this.length() ) );
            if( this.howMany() > this._canPossiblyFulfill()  ) {
                this._reject( [] );
            }
        }
    };

    SomePromiseArray.prototype.setUnwrap = function SomePromiseArray$setUnwrap() {
        this._unwrap = true;
    };

    SomePromiseArray.prototype.howMany = function SomePromiseArray$howMany() {
        return this._howMany;
    };

    SomePromiseArray.prototype.setHowMany =
    function SomePromiseArray$setHowMany( count ) {
        if( this._isResolved() ) return;
        this._howMany = count;
    };

    SomePromiseArray.prototype._promiseFulfilled =
    function SomePromiseArray$_promiseFulfilled( value ) {
        if( this._isResolved() ) return;
        this._addFulfilled( value );
        if( this._fulfilled() === this.howMany() ) {
            this._values.length = this.howMany();
            if( this.howMany() === 1 && this._unwrap ) {
                this._fulfill( this._values[0] );
            }
            else {
                this._fulfill( this._values );
            }
        }

    };
    SomePromiseArray.prototype._promiseRejected =
    function SomePromiseArray$_promiseRejected( reason ) {
        if( this._isResolved() ) return;
        this._addRejected( reason );
        if( this.howMany() > this._canPossiblyFulfill() ) {
            if( this._values.length === this.length() ) {
                this._reject([]);
            }
            else {
                this._reject( this._values.slice( this.length() + this._holes ) );
            }
        }
    };

    SomePromiseArray.prototype._fulfilled = function SomePromiseArray$_fulfilled() {
        return this._totalResolved;
    };

    SomePromiseArray.prototype._rejected = function SomePromiseArray$_rejected() {
        return this._values.length - this.length() - this._holes;
    };

    SomePromiseArray.prototype._addRejected =
    function SomePromiseArray$_addRejected( reason ) {
        this._values.push( reason );
    };

    SomePromiseArray.prototype._addFulfilled =
    function SomePromiseArray$_addFulfilled( value ) {
        this._values[ this._totalResolved++ ] = value;
    };

    SomePromiseArray.prototype._canPossiblyFulfill =
    function SomePromiseArray$_canPossiblyFulfill() {
        return this.length() - this._rejected();
    };

    return SomePromiseArray;
    };

    },{"./util.js":36}],35:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    module.exports = function( Promise ) {
        var PromiseInspection = require( "./promise_inspection.js" );

        Promise.prototype.inspect = function Promise$inspect() {
            return new PromiseInspection( this );
        };
    };

    },{"./promise_inspection.js":20}],36:[function(require,module,exports){
    /**
     * Copyright (c) 2013 Petka Antonov
     * 
     * Permission is hereby granted, free of charge, to any person obtaining a copy
     * of this software and associated documentation files (the "Software"), to deal
     * in the Software without restriction, including without limitation the rights
     * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
     * copies of the Software, and to permit persons to whom the Software is
     * furnished to do so, subject to the following conditions:</p>
     * 
     * The above copyright notice and this permission notice shall be included in
     * all copies or substantial portions of the Software.
     * 
     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
     * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
     * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
     * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
     * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
     * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
     * THE SOFTWARE.
     */
    "use strict";
    var global = require("./global.js");
    var ASSERT = require("./assert.js");
    var haveGetters = (function(){
        try {
            var o = {};
            Object.defineProperty(o, "f", {
                get: function () {
                    return 3;
                }
            });
            return o.f === 3;
        }
        catch(e) {
            return false;
        }

    })();

    var ensurePropertyExpansion = function( obj, prop, value ) {
        try {
            notEnumerableProp( obj, prop, value );
            return obj;
        }
        catch( e ) {
            var ret = {};
            var keys = Object.keys( obj );
            for( var i = 0, len = keys.length; i < len; ++i ) {
                try {
                    var key = keys[i];
                    ret[key] = obj[key];
                }
                catch( err ) {
                    ret[key] = err;
                }
            }
            notEnumerableProp( ret, prop, value );
            return ret;
        }
    };

    var canEvaluate = (function() {
        if( typeof window !== "undefined" && window !== null &&
            typeof window.document !== "undefined" &&
            typeof navigator !== "undefined" && navigator !== null &&
            typeof navigator.appName === "string" &&
            window === global ) {
            return false;
        }
        return true;
    })();

    function deprecated( msg ) {
        if( typeof console !== "undefined" && console !== null &&
            typeof console.warn === "function" ) {
            console.warn( "Bluebird: " + msg );
        }
    }

    var isArray = Array.isArray || function( obj ) {
        return obj instanceof Array;
    };



    var errorObj = {e: {}};
    function tryCatch1( fn, receiver, arg ) {
        try {
            return fn.call( receiver, arg );
        }
        catch( e ) {
            errorObj.e = e;
            return errorObj;
        }
    }

    function tryCatch2( fn, receiver, arg, arg2 ) {
        try {
            return fn.call( receiver, arg, arg2 );
        }
        catch( e ) {
            errorObj.e = e;
            return errorObj;
        }
    }

    function tryCatchApply( fn, args, receiver ) {
        try {
            return fn.apply( receiver, args );
        }
        catch( e ) {
            errorObj.e = e;
            return errorObj;
        }
    }

    var inherits = function( Child, Parent ) {
        var hasProp = {}.hasOwnProperty;

        function T() {
            this.constructor = Child;
            this.constructor$ = Parent;
            for (var propertyName in Parent.prototype) {
                if (hasProp.call( Parent.prototype, propertyName) &&
                    propertyName.charAt(propertyName.length-1) !== "$"
                ) {
                    this[ propertyName + "$"] = Parent.prototype[propertyName];
                }
            }
        }
        T.prototype = Parent.prototype;
        Child.prototype = new T();
        return Child.prototype;
    };

    function asString( val ) {
        return typeof val === "string" ? val : ( "" + val );
    }

    function isPrimitive( val ) {
        return val == null || val === true || val === false ||
            typeof val === "string" || typeof val === "number";

    }

    function isObject( value ) {
        return !isPrimitive( value );
    }

    function maybeWrapAsError( maybeError ) {
        if( !isPrimitive( maybeError ) ) return maybeError;

        return new Error( asString( maybeError ) );
    }

    function withAppended( target, appendee ) {
        var len = target.length;
        var ret = new Array( len + 1 );
        var i;
        for( i = 0; i < len; ++i ) {
            ret[ i ] = target[ i ];
        }
        ret[ i ] = appendee;
        return ret;
    }


    function notEnumerableProp( obj, name, value ) {
        var descriptor = {
            value: value,
            configurable: true,
            enumerable: false,
            writable: true
        };
        Object.defineProperty( obj, name, descriptor );
        return obj;
    }

    module.exports ={
        isArray: isArray,
        haveGetters: haveGetters,
        notEnumerableProp: notEnumerableProp,
        isPrimitive: isPrimitive,
        isObject: isObject,
        ensurePropertyExpansion: ensurePropertyExpansion,
        canEvaluate: canEvaluate,
        deprecated: deprecated,
        errorObj: errorObj,
        tryCatch1: tryCatch1,
        tryCatch2: tryCatch2,
        tryCatchApply: tryCatchApply,
        inherits: inherits,
        withAppended: withAppended,
        asString: asString,
        maybeWrapAsError: maybeWrapAsError
    };

    },{"./assert.js":2,"./global.js":14}]},{},[4])
    (4)
    //trick uglify-js into not minifying
    });

    ;
    Atomic._.Bluebird = module.exports;
  });

  cjsHarness(function(module, exports, process) {
    // export the class if we are in a Node-like system.
    if (typeof module === 'object' && module.exports === exports)
      exports = module.exports = SemVer;

    // The debug function is excluded entirely from the minified version.
    /* nomin */ var debug;
    /* nomin */ if (typeof process === 'object' &&
        /* nomin */ process.env &&
        /* nomin */ process.env.NODE_DEBUG &&
        /* nomin */ /\bsemver\b/i.test(process.env.NODE_DEBUG))
      /* nomin */ debug = function() {
        /* nomin */ var args = Array.prototype.slice.call(arguments, 0);
        /* nomin */ args.unshift('SEMVER');
        /* nomin */ console.log.apply(console, args);
        /* nomin */ };
    /* nomin */ else
      /* nomin */ debug = function() {};

    // Note: this is the semver.org version of the spec that it implements
    // Not necessarily the package version of this code.
    exports.SEMVER_SPEC_VERSION = '2.0.0';

    // The actual regexps go on exports.re
    var re = exports.re = [];
    var src = exports.src = [];
    var R = 0;

    // The following Regular Expressions can be used for tokenizing,
    // validating, and parsing SemVer version strings.

    // ## Numeric Identifier
    // A single `0`, or a non-zero digit followed by zero or more digits.

    var NUMERICIDENTIFIER = R++;
    src[NUMERICIDENTIFIER] = '0|[1-9]\\d*';
    var NUMERICIDENTIFIERLOOSE = R++;
    src[NUMERICIDENTIFIERLOOSE] = '[0-9]+';


    // ## Non-numeric Identifier
    // Zero or more digits, followed by a letter or hyphen, and then zero or
    // more letters, digits, or hyphens.

    var NONNUMERICIDENTIFIER = R++;
    src[NONNUMERICIDENTIFIER] = '\\d*[a-zA-Z-][a-zA-Z0-9-]*';


    // ## Main Version
    // Three dot-separated numeric identifiers.

    var MAINVERSION = R++;
    src[MAINVERSION] = '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                       '(' + src[NUMERICIDENTIFIER] + ')\\.' +
                       '(' + src[NUMERICIDENTIFIER] + ')';

    var MAINVERSIONLOOSE = R++;
    src[MAINVERSIONLOOSE] = '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                            '(' + src[NUMERICIDENTIFIERLOOSE] + ')\\.' +
                            '(' + src[NUMERICIDENTIFIERLOOSE] + ')';

    // ## Pre-release Version Identifier
    // A numeric identifier, or a non-numeric identifier.

    var PRERELEASEIDENTIFIER = R++;
    src[PRERELEASEIDENTIFIER] = '(?:' + src[NUMERICIDENTIFIER] +
                                '|' + src[NONNUMERICIDENTIFIER] + ')';

    var PRERELEASEIDENTIFIERLOOSE = R++;
    src[PRERELEASEIDENTIFIERLOOSE] = '(?:' + src[NUMERICIDENTIFIERLOOSE] +
                                     '|' + src[NONNUMERICIDENTIFIER] + ')';


    // ## Pre-release Version
    // Hyphen, followed by one or more dot-separated pre-release version
    // identifiers.

    var PRERELEASE = R++;
    src[PRERELEASE] = '(?:-(' + src[PRERELEASEIDENTIFIER] +
                      '(?:\\.' + src[PRERELEASEIDENTIFIER] + ')*))';

    var PRERELEASELOOSE = R++;
    src[PRERELEASELOOSE] = '(?:-?(' + src[PRERELEASEIDENTIFIERLOOSE] +
                           '(?:\\.' + src[PRERELEASEIDENTIFIERLOOSE] + ')*))';

    // ## Build Metadata Identifier
    // Any combination of digits, letters, or hyphens.

    var BUILDIDENTIFIER = R++;
    src[BUILDIDENTIFIER] = '[0-9A-Za-z-]+';

    // ## Build Metadata
    // Plus sign, followed by one or more period-separated build metadata
    // identifiers.

    var BUILD = R++;
    src[BUILD] = '(?:\\+(' + src[BUILDIDENTIFIER] +
                 '(?:\\.' + src[BUILDIDENTIFIER] + ')*))';


    // ## Full Version String
    // A main version, followed optionally by a pre-release version and
    // build metadata.

    // Note that the only major, minor, patch, and pre-release sections of
    // the version string are capturing groups.  The build metadata is not a
    // capturing group, because it should not ever be used in version
    // comparison.

    var FULL = R++;
    var FULLPLAIN = 'v?' + src[MAINVERSION] +
                    src[PRERELEASE] + '?' +
                    src[BUILD] + '?';

    src[FULL] = '^' + FULLPLAIN + '$';

    // like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
    // also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
    // common in the npm registry.
    var LOOSEPLAIN = '[v=\\s]*' + src[MAINVERSIONLOOSE] +
                     src[PRERELEASELOOSE] + '?' +
                     src[BUILD] + '?';

    var LOOSE = R++;
    src[LOOSE] = '^' + LOOSEPLAIN + '$';

    var GTLT = R++;
    src[GTLT] = '((?:<|>)?=?)';

    // Something like "2.*" or "1.2.x".
    // Note that "x.x" is a valid xRange identifer, meaning "any version"
    // Only the first item is strictly required.
    var XRANGEIDENTIFIERLOOSE = R++;
    src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + '|x|X|\\*';
    var XRANGEIDENTIFIER = R++;
    src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + '|x|X|\\*';

    var XRANGEPLAIN = R++;
    src[XRANGEPLAIN] = '[v=\\s]*(' + src[XRANGEIDENTIFIER] + ')' +
                       '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                       '(?:\\.(' + src[XRANGEIDENTIFIER] + ')' +
                       '(?:(' + src[PRERELEASE] + ')' +
                       ')?)?)?';

    var XRANGEPLAINLOOSE = R++;
    src[XRANGEPLAINLOOSE] = '[v=\\s]*(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                            '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                            '(?:\\.(' + src[XRANGEIDENTIFIERLOOSE] + ')' +
                            '(?:(' + src[PRERELEASELOOSE] + ')' +
                            ')?)?)?';

    // >=2.x, for example, means >=2.0.0-0
    // <1.x would be the same as "<1.0.0-0", though.
    var XRANGE = R++;
    src[XRANGE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAIN] + '$';
    var XRANGELOOSE = R++;
    src[XRANGELOOSE] = '^' + src[GTLT] + '\\s*' + src[XRANGEPLAINLOOSE] + '$';

    // Tilde ranges.
    // Meaning is "reasonably at or greater than"
    var LONETILDE = R++;
    src[LONETILDE] = '(?:~>?)';

    var TILDETRIM = R++;
    src[TILDETRIM] = '(\\s*)' + src[LONETILDE] + '\\s+';
    re[TILDETRIM] = new RegExp(src[TILDETRIM], 'g');
    var tildeTrimReplace = '$1~';

    var TILDE = R++;
    src[TILDE] = '^' + src[LONETILDE] + src[XRANGEPLAIN] + '$';
    var TILDELOOSE = R++;
    src[TILDELOOSE] = '^' + src[LONETILDE] + src[XRANGEPLAINLOOSE] + '$';

    // Caret ranges.
    // Meaning is "at least and backwards compatible with"
    var LONECARET = R++;
    src[LONECARET] = '(?:\\^)';

    var CARETTRIM = R++;
    src[CARETTRIM] = '(\\s*)' + src[LONECARET] + '\\s+';
    re[CARETTRIM] = new RegExp(src[CARETTRIM], 'g');
    var caretTrimReplace = '$1^';

    var CARET = R++;
    src[CARET] = '^' + src[LONECARET] + src[XRANGEPLAIN] + '$';
    var CARETLOOSE = R++;
    src[CARETLOOSE] = '^' + src[LONECARET] + src[XRANGEPLAINLOOSE] + '$';

    // A simple gt/lt/eq thing, or just "" to indicate "any version"
    var COMPARATORLOOSE = R++;
    src[COMPARATORLOOSE] = '^' + src[GTLT] + '\\s*(' + LOOSEPLAIN + ')$|^$';
    var COMPARATOR = R++;
    src[COMPARATOR] = '^' + src[GTLT] + '\\s*(' + FULLPLAIN + ')$|^$';


    // An expression to strip any whitespace between the gtlt and the thing
    // it modifies, so that `> 1.2.3` ==> `>1.2.3`
    var COMPARATORTRIM = R++;
    src[COMPARATORTRIM] = '(\\s*)' + src[GTLT] +
                          '\\s*(' + LOOSEPLAIN + '|' + src[XRANGEPLAIN] + ')';

    // this one has to use the /g flag
    re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], 'g');
    var comparatorTrimReplace = '$1$2$3';


    // Something like `1.2.3 - 1.2.4`
    // Note that these all use the loose form, because they'll be
    // checked against either the strict or loose comparator form
    // later.
    var HYPHENRANGE = R++;
    src[HYPHENRANGE] = '^\\s*(' + src[XRANGEPLAIN] + ')' +
                       '\\s+-\\s+' +
                       '(' + src[XRANGEPLAIN] + ')' +
                       '\\s*$';

    var HYPHENRANGELOOSE = R++;
    src[HYPHENRANGELOOSE] = '^\\s*(' + src[XRANGEPLAINLOOSE] + ')' +
                            '\\s+-\\s+' +
                            '(' + src[XRANGEPLAINLOOSE] + ')' +
                            '\\s*$';

    // Star ranges basically just allow anything at all.
    var STAR = R++;
    src[STAR] = '(<|>)?=?\\s*\\*';

    // Compile to actual regexp objects.
    // All are flag-free, unless they were created above with a flag.
    for (var i = 0; i < R; i++) {
      debug(i, src[i]);
      if (!re[i])
        re[i] = new RegExp(src[i]);
    }

    exports.parse = parse;
    function parse(version, loose) {
      var r = loose ? re[LOOSE] : re[FULL];
      return (r.test(version)) ? new SemVer(version, loose) : null;
    }

    exports.valid = valid;
    function valid(version, loose) {
      var v = parse(version, loose);
      return v ? v.version : null;
    }


    exports.clean = clean;
    function clean(version, loose) {
      var s = parse(version, loose);
      return s ? s.version : null;
    }

    exports.SemVer = SemVer;

    function SemVer(version, loose) {
      if (version instanceof SemVer) {
        if (version.loose === loose)
          return version;
        else
          version = version.version;
      }

      if (!(this instanceof SemVer))
        return new SemVer(version, loose);

      debug('SemVer', version, loose);
      this.loose = loose;
      var m = version.trim().match(loose ? re[LOOSE] : re[FULL]);

      if (!m)
        throw new TypeError('Invalid Version: ' + version);

      this.raw = version;

      // these are actually numbers
      this.major = +m[1];
      this.minor = +m[2];
      this.patch = +m[3];

      // numberify any prerelease numeric ids
      if (!m[4])
        this.prerelease = [];
      else
        this.prerelease = m[4].split('.').map(function(id) {
          return (/^[0-9]+$/.test(id)) ? +id : id;
        });

      this.build = m[5] ? m[5].split('.') : [];
      this.format();
    }

    SemVer.prototype.format = function() {
      this.version = this.major + '.' + this.minor + '.' + this.patch;
      if (this.prerelease.length)
        this.version += '-' + this.prerelease.join('.');
      return this.version;
    };

    SemVer.prototype.inspect = function() {
      return '<SemVer "' + this + '">';
    };

    SemVer.prototype.toString = function() {
      return this.version;
    };

    SemVer.prototype.compare = function(other) {
      debug('SemVer.compare', this.version, this.loose, other);
      if (!(other instanceof SemVer))
        other = new SemVer(other, this.loose);

      return this.compareMain(other) || this.comparePre(other);
    };

    SemVer.prototype.compareMain = function(other) {
      if (!(other instanceof SemVer))
        other = new SemVer(other, this.loose);

      return compareIdentifiers(this.major, other.major) ||
             compareIdentifiers(this.minor, other.minor) ||
             compareIdentifiers(this.patch, other.patch);
    };

    SemVer.prototype.comparePre = function(other) {
      if (!(other instanceof SemVer))
        other = new SemVer(other, this.loose);

      // NOT having a prerelease is > having one
      if (this.prerelease.length && !other.prerelease.length)
        return -1;
      else if (!this.prerelease.length && other.prerelease.length)
        return 1;
      else if (!this.prerelease.lenth && !other.prerelease.length)
        return 0;

      var i = 0;
      do {
        var a = this.prerelease[i];
        var b = other.prerelease[i];
        debug('prerelease compare', i, a, b);
        if (a === undefined && b === undefined)
          return 0;
        else if (b === undefined)
          return 1;
        else if (a === undefined)
          return -1;
        else if (a === b)
          continue;
        else
          return compareIdentifiers(a, b);
      } while (++i);
    };

    SemVer.prototype.inc = function(release) {
      switch (release) {
        case 'major':
          this.major++;
          this.minor = -1;
        case 'minor':
          this.minor++;
          this.patch = -1;
        case 'patch':
          this.patch++;
          this.prerelease = [];
          break;
        case 'prerelease':
          if (this.prerelease.length === 0)
            this.prerelease = [0];
          else {
            var i = this.prerelease.length;
            while (--i >= 0) {
              if (typeof this.prerelease[i] === 'number') {
                this.prerelease[i]++;
                i = -2;
              }
            }
            if (i === -1) // didn't increment anything
              this.prerelease.push(0);
          }
          break;

        default:
          throw new Error('invalid increment argument: ' + release);
      }
      this.format();
      return this;
    };

    exports.inc = inc;
    function inc(version, release, loose) {
      try {
        return new SemVer(version, loose).inc(release).version;
      } catch (er) {
        return null;
      }
    }

    exports.compareIdentifiers = compareIdentifiers;

    var numeric = /^[0-9]+$/;
    function compareIdentifiers(a, b) {
      var anum = numeric.test(a);
      var bnum = numeric.test(b);

      if (anum && bnum) {
        a = +a;
        b = +b;
      }

      return (anum && !bnum) ? -1 :
             (bnum && !anum) ? 1 :
             a < b ? -1 :
             a > b ? 1 :
             0;
    }

    exports.rcompareIdentifiers = rcompareIdentifiers;
    function rcompareIdentifiers(a, b) {
      return compareIdentifiers(b, a);
    }

    exports.compare = compare;
    function compare(a, b, loose) {
      return new SemVer(a, loose).compare(b);
    }

    exports.compareLoose = compareLoose;
    function compareLoose(a, b) {
      return compare(a, b, true);
    }

    exports.rcompare = rcompare;
    function rcompare(a, b, loose) {
      return compare(b, a, loose);
    }

    exports.sort = sort;
    function sort(list, loose) {
      return list.sort(function(a, b) {
        return exports.compare(a, b, loose);
      });
    }

    exports.rsort = rsort;
    function rsort(list, loose) {
      return list.sort(function(a, b) {
        return exports.rcompare(a, b, loose);
      });
    }

    exports.gt = gt;
    function gt(a, b, loose) {
      return compare(a, b, loose) > 0;
    }

    exports.lt = lt;
    function lt(a, b, loose) {
      return compare(a, b, loose) < 0;
    }

    exports.eq = eq;
    function eq(a, b, loose) {
      return compare(a, b, loose) === 0;
    }

    exports.neq = neq;
    function neq(a, b, loose) {
      return compare(a, b, loose) !== 0;
    }

    exports.gte = gte;
    function gte(a, b, loose) {
      return compare(a, b, loose) >= 0;
    }

    exports.lte = lte;
    function lte(a, b, loose) {
      return compare(a, b, loose) <= 0;
    }

    exports.cmp = cmp;
    function cmp(a, op, b, loose) {
      var ret;
      switch (op) {
        case '===': ret = a === b; break;
        case '!==': ret = a !== b; break;
        case '': case '=': case '==': ret = eq(a, b, loose); break;
        case '!=': ret = neq(a, b, loose); break;
        case '>': ret = gt(a, b, loose); break;
        case '>=': ret = gte(a, b, loose); break;
        case '<': ret = lt(a, b, loose); break;
        case '<=': ret = lte(a, b, loose); break;
        default: throw new TypeError('Invalid operator: ' + op);
      }
      return ret;
    }

    exports.Comparator = Comparator;
    function Comparator(comp, loose) {
      if (comp instanceof Comparator) {
        if (comp.loose === loose)
          return comp;
        else
          comp = comp.value;
      }

      if (!(this instanceof Comparator))
        return new Comparator(comp, loose);

      debug('comparator', comp, loose);
      this.loose = loose;
      this.parse(comp);

      if (this.semver === ANY)
        this.value = '';
      else
        this.value = this.operator + this.semver.version;
    }

    var ANY = {};
    Comparator.prototype.parse = function(comp) {
      var r = this.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
      var m = comp.match(r);

      if (!m)
        throw new TypeError('Invalid comparator: ' + comp);

      this.operator = m[1];
      // if it literally is just '>' or '' then allow anything.
      if (!m[2])
        this.semver = ANY;
      else {
        this.semver = new SemVer(m[2], this.loose);

        // <1.2.3-rc DOES allow 1.2.3-beta (has prerelease)
        // >=1.2.3 DOES NOT allow 1.2.3-beta
        // <=1.2.3 DOES allow 1.2.3-beta
        // However, <1.2.3 does NOT allow 1.2.3-beta,
        // even though `1.2.3-beta < 1.2.3`
        // The assumption is that the 1.2.3 version has something you
        // *don't* want, so we push the prerelease down to the minimum.
        if (this.operator === '<' && !this.semver.prerelease.length) {
          this.semver.prerelease = ['0'];
          this.semver.format();
        }
      }
    };

    Comparator.prototype.inspect = function() {
      return '<SemVer Comparator "' + this + '">';
    };

    Comparator.prototype.toString = function() {
      return this.value;
    };

    Comparator.prototype.test = function(version) {
      debug('Comparator.test', version, this.loose);
      return (this.semver === ANY) ? true :
             cmp(version, this.operator, this.semver, this.loose);
    };


    exports.Range = Range;
    function Range(range, loose) {
      if ((range instanceof Range) && range.loose === loose)
        return range;

      if (!(this instanceof Range))
        return new Range(range, loose);

      this.loose = loose;

      // First, split based on boolean or ||
      this.raw = range;
      this.set = range.split(/\s*\|\|\s*/).map(function(range) {
        return this.parseRange(range.trim());
      }, this).filter(function(c) {
        // throw out any that are not relevant for whatever reason
        return c.length;
      });

      if (!this.set.length) {
        throw new TypeError('Invalid SemVer Range: ' + range);
      }

      this.format();
    }

    Range.prototype.inspect = function() {
      return '<SemVer Range "' + this.range + '">';
    };

    Range.prototype.format = function() {
      this.range = this.set.map(function(comps) {
        return comps.join(' ').trim();
      }).join('||').trim();
      return this.range;
    };

    Range.prototype.toString = function() {
      return this.range;
    };

    Range.prototype.parseRange = function(range) {
      var loose = this.loose;
      range = range.trim();
      debug('range', range, loose);
      // `1.2.3 - 1.2.4` => `>=1.2.3 <=1.2.4`
      var hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
      range = range.replace(hr, hyphenReplace);
      debug('hyphen replace', range);
      // `> 1.2.3 < 1.2.5` => `>1.2.3 <1.2.5`
      range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
      debug('comparator trim', range, re[COMPARATORTRIM]);

      // `~ 1.2.3` => `~1.2.3`
      range = range.replace(re[TILDETRIM], tildeTrimReplace);

      // `^ 1.2.3` => `^1.2.3`
      range = range.replace(re[CARETTRIM], caretTrimReplace);

      // normalize spaces
      range = range.split(/\s+/).join(' ');

      // At this point, the range is completely trimmed and
      // ready to be split into comparators.

      var compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
      var set = range.split(' ').map(function(comp) {
        return parseComparator(comp, loose);
      }).join(' ').split(/\s+/);
      if (this.loose) {
        // in loose mode, throw out any that are not valid comparators
        set = set.filter(function(comp) {
          return !!comp.match(compRe);
        });
      }
      set = set.map(function(comp) {
        return new Comparator(comp, loose);
      });

      return set;
    };

    // Mostly just for testing and legacy API reasons
    exports.toComparators = toComparators;
    function toComparators(range, loose) {
      return new Range(range, loose).set.map(function(comp) {
        return comp.map(function(c) {
          return c.value;
        }).join(' ').trim().split(' ');
      });
    }

    // comprised of xranges, tildes, stars, and gtlt's at this point.
    // already replaced the hyphen ranges
    // turn into a set of JUST comparators.
    function parseComparator(comp, loose) {
      debug('comp', comp);
      comp = replaceCarets(comp, loose);
      debug('caret', comp);
      comp = replaceTildes(comp, loose);
      debug('tildes', comp);
      comp = replaceXRanges(comp, loose);
      debug('xrange', comp);
      comp = replaceStars(comp, loose);
      debug('stars', comp);
      return comp;
    }

    function isX(id) {
      return !id || id.toLowerCase() === 'x' || id === '*';
    }

    // ~, ~> --> * (any, kinda silly)
    // ~2, ~2.x, ~2.x.x, ~>2, ~>2.x ~>2.x.x --> >=2.0.0 <3.0.0
    // ~2.0, ~2.0.x, ~>2.0, ~>2.0.x --> >=2.0.0 <2.1.0
    // ~1.2, ~1.2.x, ~>1.2, ~>1.2.x --> >=1.2.0 <1.3.0
    // ~1.2.3, ~>1.2.3 --> >=1.2.3 <1.3.0
    // ~1.2.0, ~>1.2.0 --> >=1.2.0 <1.3.0
    function replaceTildes(comp, loose) {
      return comp.trim().split(/\s+/).map(function(comp) {
        return replaceTilde(comp, loose);
      }).join(' ');
    }

    function replaceTilde(comp, loose) {
      var r = loose ? re[TILDELOOSE] : re[TILDE];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug('tilde', comp, _, M, m, p, pr);
        var ret;

        if (isX(M))
          ret = '';
        else if (isX(m))
          ret = '>=' + M + '.0.0-0 <' + (+M + 1) + '.0.0-0';
        else if (isX(p))
          // ~1.2 == >=1.2.0- <1.3.0-
          ret = '>=' + M + '.' + m + '.0-0 <' + M + '.' + (+m + 1) + '.0-0';
        else if (pr) {
          debug('replaceTilde pr', pr);
          if (pr.charAt(0) !== '-')
            pr = '-' + pr;
          ret = '>=' + M + '.' + m + '.' + p + pr +
                ' <' + M + '.' + (+m + 1) + '.0-0';
        } else
          // ~1.2.3 == >=1.2.3-0 <1.3.0-0
          ret = '>=' + M + '.' + m + '.' + p + '-0' +
                ' <' + M + '.' + (+m + 1) + '.0-0';

        debug('tilde return', ret);
        return ret;
      });
    }

    // ^ --> * (any, kinda silly)
    // ^2, ^2.x, ^2.x.x --> >=2.0.0 <3.0.0
    // ^2.0, ^2.0.x --> >=2.0.0 <3.0.0
    // ^1.2, ^1.2.x --> >=1.2.0 <2.0.0
    // ^1.2.3 --> >=1.2.3 <2.0.0
    // ^1.2.0 --> >=1.2.0 <2.0.0
    function replaceCarets(comp, loose) {
      return comp.trim().split(/\s+/).map(function(comp) {
        return replaceCaret(comp, loose);
      }).join(' ');
    }

    function replaceCaret(comp, loose) {
      var r = loose ? re[CARETLOOSE] : re[CARET];
      return comp.replace(r, function(_, M, m, p, pr) {
        debug('caret', comp, _, M, m, p, pr);
        var ret;

        if (isX(M))
          ret = '';
        else if (isX(m))
          ret = '>=' + M + '.0.0-0 <' + (+M + 1) + '.0.0-0';
        else if (isX(p)) {
          if (M === '0')
            ret = '>=' + M + '.' + m + '.0-0 <' + M + '.' + (+m + 1) + '.0-0';
          else
            ret = '>=' + M + '.' + m + '.0-0 <' + (+M + 1) + '.0.0-0';
        } else if (pr) {
          debug('replaceCaret pr', pr);
          if (pr.charAt(0) !== '-')
            pr = '-' + pr;
          if (M === '0') {
            if (m === '0')
              ret = '=' + M + '.' + m + '.' + p + pr;
            else
              ret = '>=' + M + '.' + m + '.' + p + pr +
                    ' <' + M + '.' + (+m + 1) + '.0-0';
          } else
            ret = '>=' + M + '.' + m + '.' + p + pr +
                  ' <' + (+M + 1) + '.0.0-0';
        } else {
          if (M === '0') {
            if (m === '0')
              ret = '=' + M + '.' + m + '.' + p;
            else
              ret = '>=' + M + '.' + m + '.' + p + '-0' +
                    ' <' + M + '.' + (+m + 1) + '.0-0';
          } else
            ret = '>=' + M + '.' + m + '.' + p + '-0' +
                  ' <' + (+M + 1) + '.0.0-0';
        }

        debug('caret return', ret);
        return ret;
      });
    }

    function replaceXRanges(comp, loose) {
      debug('replaceXRanges', comp, loose);
      return comp.split(/\s+/).map(function(comp) {
        return replaceXRange(comp, loose);
      }).join(' ');
    }

    function replaceXRange(comp, loose) {
      comp = comp.trim();
      var r = loose ? re[XRANGELOOSE] : re[XRANGE];
      return comp.replace(r, function(ret, gtlt, M, m, p, pr) {
        debug('xRange', comp, ret, gtlt, M, m, p, pr);
        var xM = isX(M);
        var xm = xM || isX(m);
        var xp = xm || isX(p);
        var anyX = xp;

        if (gtlt === '=' && anyX)
          gtlt = '';

        if (gtlt && anyX) {
          // replace X with 0, and then append the -0 min-prerelease
          if (xM)
            M = 0;
          if (xm)
            m = 0;
          if (xp)
            p = 0;

          if (gtlt === '>') {
            // >1 => >=2.0.0-0
            // >1.2 => >=1.3.0-0
            // >1.2.3 => >= 1.2.4-0
            gtlt = '>=';
            if (xM) {
              // no change
            } else if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else if (xp) {
              m = +m + 1;
              p = 0;
            }
          }


          ret = gtlt + M + '.' + m + '.' + p + '-0';
        } else if (xM) {
          // allow any
          ret = '*';
        } else if (xm) {
          // append '-0' onto the version, otherwise
          // '1.x.x' matches '2.0.0-beta', since the tag
          // *lowers* the version value
          ret = '>=' + M + '.0.0-0 <' + (+M + 1) + '.0.0-0';
        } else if (xp) {
          ret = '>=' + M + '.' + m + '.0-0 <' + M + '.' + (+m + 1) + '.0-0';
        }

        debug('xRange return', ret);

        return ret;
      });
    }

    // Because * is AND-ed with everything else in the comparator,
    // and '' means "any version", just remove the *s entirely.
    function replaceStars(comp, loose) {
      debug('replaceStars', comp, loose);
      // Looseness is ignored here.  star is always as loose as it gets!
      return comp.trim().replace(re[STAR], '');
    }

    // This function is passed to string.replace(re[HYPHENRANGE])
    // M, m, patch, prerelease, build
    // 1.2 - 3.4.5 => >=1.2.0-0 <=3.4.5
    // 1.2.3 - 3.4 => >=1.2.0-0 <3.5.0-0 Any 3.4.x will do
    // 1.2 - 3.4 => >=1.2.0-0 <3.5.0-0
    function hyphenReplace($0,
                           from, fM, fm, fp, fpr, fb,
                           to, tM, tm, tp, tpr, tb) {

      if (isX(fM))
        from = '';
      else if (isX(fm))
        from = '>=' + fM + '.0.0-0';
      else if (isX(fp))
        from = '>=' + fM + '.' + fm + '.0-0';
      else
        from = '>=' + from;

      if (isX(tM))
        to = '';
      else if (isX(tm))
        to = '<' + (+tM + 1) + '.0.0-0';
      else if (isX(tp))
        to = '<' + tM + '.' + (+tm + 1) + '.0-0';
      else if (tpr)
        to = '<=' + tM + '.' + tm + '.' + tp + '-' + tpr;
      else
        to = '<=' + to;

      return (from + ' ' + to).trim();
    }


    // if ANY of the sets match ALL of its comparators, then pass
    Range.prototype.test = function(version) {
      if (!version)
        return false;
      for (var i = 0; i < this.set.length; i++) {
        if (testSet(this.set[i], version))
          return true;
      }
      return false;
    };

    function testSet(set, version) {
      for (var i = 0; i < set.length; i++) {
        if (!set[i].test(version))
          return false;
      }
      return true;
    }

    exports.satisfies = satisfies;
    function satisfies(version, range, loose) {
      try {
        range = new Range(range, loose);
      } catch (er) {
        return false;
      }
      return range.test(version);
    }

    exports.maxSatisfying = maxSatisfying;
    function maxSatisfying(versions, range, loose) {
      return versions.filter(function(version) {
        return satisfies(version, range, loose);
      }).sort(function(a, b) {
        return rcompare(a, b, loose);
      })[0] || null;
    }

    exports.validRange = validRange;
    function validRange(range, loose) {
      try {
        // Return '*' instead of '' so that truthiness works.
        // This will throw if it's invalid anyway
        return new Range(range, loose).range || '*';
      } catch (er) {
        return null;
      }
    }

    // Determine if version is less than all the versions possible in the range
    exports.ltr = ltr;
    function ltr(version, range, loose) {
      return outside(version, range, '<', loose);
    }

    // Determine if version is greater than all the versions possible in the range.
    exports.gtr = gtr;
    function gtr(version, range, loose) {
      return outside(version, range, '>', loose);
    }

    exports.outside = outside;
    function outside(version, range, hilo, loose) {
      version = new SemVer(version, loose);
      range = new Range(range, loose);

      var gtfn, ltefn, ltfn, comp, ecomp;
      switch (hilo) {
        case '>':
          gtfn = gt;
          ltefn = lte;
          ltfn = lt;
          comp = '>';
          ecomp = '>=';
          break;
        case '<':
          gtfn = lt;
          ltefn = gte;
          ltfn = gt;
          comp = '<';
          ecomp = '<=';
          break;
        default:
          throw new TypeError('Must provide a hilo val of "<" or ">"');
      }

      // If it satisifes the range it is not outside
      if (satisfies(version, range, loose)) {
        return false;
      }

      // From now on, variable terms are as if we're in "gtr" mode.
      // but note that everything is flipped for the "ltr" function.

      for (var i = 0; i < range.set.length; ++i) {
        var comparators = range.set[i];

        var high = null;
        var low = null;

        comparators.forEach(function(comparator) {
          high = high || comparator;
          low = low || comparator;
          if (gtfn(comparator.semver, high.semver, loose)) {
            high = comparator;
          } else if (ltfn(comparator.semver, low.semver, loose)) {
            low = comparator;
          }
        });

        // If the edge version comparator has a operator then our version
        // isn't outside it
        if (high.operator === comp || high.operator === ecomp) {
          return false;
        }

        // If the lowest version comparator has an operator and our version
        // is less than it then it isn't higher than the range
        if ((!low.operator || low.operator === comp) &&
            ltefn(version, low.semver)) {
          return false;
        } else if (low.operator === ecomp && ltfn(version, low.semver)) {
          return false;
        }
      }
      return true;
    }

    // Use the define() function if we're in AMD land
    if (typeof define === 'function' && define.amd)
      define(exports);

    Atomic._.SemVer = module.exports;
  });

  // --------------------------------------------------
  // CLASSES
  // --------------------------------------------------
  /*global Atomic:true */
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
   * AbstractComponent a template for creating Components in Atomic
   * Components are the lego blocks of Atomic. They emit events
   * at interesting moments, and can be combined with additional
   * components to create Composites.
   * @class AbstractComponent
   */
  (function(Atomic) {
    var AbstractComponent = Atomic._.Fiber.extend(function (base) {
      return {
        /**
         * A simple ID to be overridden. Useful in debugging
         * @property {String} AbstractComponent#name
         */
        name: 'AbstractComponent. Override me to improve debugging',
      
        /**
         * The module path for this. Used in debugging and BEM syntax
         * @property {String} id
         */
        id: 'abstractcomponent',

        /**
         * An array of dependencies this module needs to run
         * These are modules the implementing component needs
         * @property {Array} AbstractComponent#depends
         */
        depends: [],

        /**
         * A key/string collection of nodes and their purpose
         * These are nodes that components need to have in order to function.
         * This object is overriden with an instance variable during the constructor
         * @property {Object} AbstractComponent#elements
         */
        elements: {},

        /**
         * A key/string collection of events
         * These are events that the AbstractComponent can emit
         * Overriden with an instance variable during the constructor
         * @property {Object} AbstractComponent#events
         */
        events: {},
      
        /**
         * A key/string collection of states
         * These allow a developer to document the states used in the
         * component. In order to set state using this.state(), you will
         * also need to have the state object registered here
         * to ensure all states are documented.
         * @property {Object} AbstractComponent#states
         */
        states: {},

        /**
         * A configuration for this instance of the object
         * contains any unknown key/value pairs passed into the
         * constructor
         * @property {Object} AbstractComponent#config
         */
        config: {},

        /**
         * The real initialization function when called in response to load
         * This is where app logic resides
         * @property {Array} AbstractComponent#_init
         * @private
         */
        _init: null,
      
        /**
         * The internal state object
         * @property {Object} AbstractComponent#_state
         * @private
         */
        _state: {},

        /**
         * A local event emitter
         * @property {EventEmitter} AbstractComponent#_eventEmitter
         * @private
         */
        _eventEmitter: null,
      
        /**
         * A local event emitter
         * used for the observer channel to forcibly separate events from observe
         * @property {EventEmitter} AbstractComponent#_observableEmitter
         * @private
         */
        _observableEmitter: null,

        /**
         * Has this object been destroyed
         * @property {Boolean} AbstractComponent#_isDestroyed
         * @private
         */
        _isDestroyed: false,

        /**
         * The initializer for a component
         * The optional el, if provided, will then perform an attach on
         * your behalf.
         * @constructor
         * @param {HTMLElement} el - an optional HTML element
         * @param {Object} overrides - any configuration overrides to provide to this object
         */
        init: function (el, overrides) {
          var name, nodeName;

          // set assigned, etc all to local instance-level variables
          this._init = function() {};
          this.config = {};
          this._eventEmitter = new Atomic._.EventEmitter({
            wildcard: false,
            newListener: false,
            maxListeners: 20
          });
          this._observableEmitter = new Atomic._.EventEmitter({
            wildcard: false,
            newListener: false,
            maxListeners: 0
          });
        
          this.elements.root = 'The root HTML node of this component (automatically generated)';

          // localize the nodes/events/needs variable BEFORE the user starts configuring
          // nodes and needs can accept overwriting
          this.elements = createDisplayableObject(this.elements, true);
          this.events = createDisplayableObject(this.events, true, true);
          this.states = createDisplayableObject(this.states, true, true);
          this.depends = createDisplayableObject(this.depends);

          // attach the el
          if (el) {
            this.attach(el);
          }

          // handle overrides
          if (overrides) {
            for (name in overrides) {
              if (!overrides.hasOwnProperty(name)) {
                continue;
              }
              if (typeof(this[name]) === 'function') {
                // can't override a function here
                continue;
              }
              else if (name.indexOf('_') === 0) {
                // can't override a _ property here
                continue;
              }
              else if (name === 'depends' || name === 'events' || name === 'config') {
                // needs and events should be wired in. using config for this is just silly
                continue;
              }
              else if (name === 'elements') {
                for (nodeName in overrides.elements) {
                  if (overrides.elements.hasOwnProperty(nodeName)) {
                    this.elements._.set(nodeName, overrides.elements[nodeName]);
                  }
                }
              }
              else {
                // everything else is assigned to config
                this.config[name] = overrides[name];
              }
            }
          }
        },

        /**
         * Assign a node to the component.elements collection
         * @method AbstractComponent#assign
         * @param {String} name - the node to assign. Use a component.elements reference
         * @param {HTMLElement} el - an element to assign to the role.
         */
        assign: function(name, el) {
          // make sure this is an element that is allowed
          if (!this.elements._.exists(name)) {
            throw new Error('Invalid element: ' + name + '. Only elements defined in this.elements:{} may be assigned');
          }
        
          this.elements._.set(name, el);
          return this;
        },
  	
        /**
         * Assign a dependency to the component.depends collection
         * @method AbstractComponent#resolve
         * @param {String} name - the dependency to resolve. Use a component.depends reference
         * @param {Object} obj - the resolved object
         */
        resolve: function(name, obj) {
          // make sure this is an dependency that is allowed to be resolved
          if (!this.depends._.exists(name)) {
            throw new Error('Invalid dependency: ' + name + '. Only dependencies defined in this.depends:[] may be resolved');
          }
        
          this.depends._.set(name, obj);
          return this;
        },

        /**
         * Destroy the object, removing DOM element and event bindings
         * @method AbstractComponent#destroy
         */
        destroy: function () {
          this._isDestroyed = true;
          this.offAny();
          if(this.elements().root.parentNode) {
            this.elements().root.parentNode.removeChild(this.elements().root);
          }
          this.removeAllListeners();
          return null;
        },

        /**
         * Listen for events emitted by the Component
         * @method AbstractComponent#on
         * @param {String} name - the event name
         * @param {Function} fn - the callback function
         */
        on: function (name, fn) {
          if (name ===  '*') {
            this._eventEmitter.onAny(fn);
          }
          else {
            this._eventEmitter.on(name, fn);
          }
          return this;
        },

        /**
         * Remove an event added via on
         * @method AbstractComponent#off
         * @param {String} name - the name to remove callbacks from
         * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
         */
        off: function (name, fn /* optional */) {
          if (name === '*') {
            if (!fn) {
              this._eventEmitter.offAll(name);
            }
            else {
              this._eventEmitter.offAny(fn);
            }
          }
          else {
            this._eventEmitter.off(name, fn);
          }
          return this;
        },

        /**
         * Queue a callback to run once, and then remove itself
         * @method AbstractComponent#onOnce
         * @param {String} name - the event name
         * @param {Function} fn - the callback function
         */
        onOnce: function (name, fn) {
          this._eventEmitter.onOnce(name, fn);
          return this;
        },

        /**
         * set the maximum number of listeners this component can support
         * highly interactive components can increase the base number,
         * but setting arbitrarily large numbers should be a performance
         * warning.
         * @method AbstractComponent#setMaxListeners
         * @param {Number} count - the max number of listeners
         */
        setMaxListeners: function (count) {
          this._eventEmitter.setMaxListeners(count);
          return this;
        },

        /**
         * Get a list of all the current listeners
         * @method AbstractComponent#listeners
         * @returns {Array}
         */
        listeners: function (name) {
          var anyListeners = this._eventEmitter.listenersAny();
          var listeners = this._eventEmitter.listeners(name);
          return listeners.concat(anyListeners);
        },

        /**
         * Trigger an event
         * This triggers the specified event string, calling all
         * listeners that are subscribed to it.
         * @method AbstractComponent#trigger
         * @param {String} name - the event name
         * @param {Object} ... - any additional arguments to pass in the event
         */
        trigger: function () {
          var args = [].slice.call(arguments, 0);
          var name = args[0];
        
          // make sure this is an event that is allowed to be triggered
          if (!this.events._.exists(name)) {
            throw new Error('Invalid event: ' + name + '. Only events defined in this.events:{} may be triggered');
          }
        
          this._eventEmitter.emit.apply(this._eventEmitter, args);
          return this;
        },

        /**
         * Provides an easy way to link an event and method
         * @method AbstractComponent#bind
         * @param {Object} eventing - an eventing object
         * @param {String} eventName - the name of the event to listen to
         * @param {String|Function} method - the method to invoke. If a string, resolves under this.*
         */
        bind: function (eventing, eventName, method) {
          if (typeof method === 'string') {
            eventing.on(eventName, Atomic.proxy(this[method], this));
          }
          else {
            eventing.on(eventName, method);
          }
          return this;
        },

        /**
         * Remove a bind() operation
         * @method AbstractComponent#unbind
         * @param {Object} eventing - an eventing object
         * @param {String} eventName - optional. an event name to unsubscribe from
         * @param {String|Function} method - optional. the method to remove. If a string, resolves under this.*
         */
        unbind: function (eventing, eventName, method) {
          if (typeof method === 'string') {
            eventing.off(eventName, this[method]);
          }
          else if (typeof method === 'function') {
            eventing.off(eventName, method);
          }
          else {
            eventing.off(eventName);
          }
          return this;
        },

        /**
         * Wrap a method with a new function
         * The new function gets the old function as its first parameter
         * @method AbstractComponent#wrap
         * @param {String} method - method to augment
         * @param {Function} fn - custom function to execute. Gets the original function as the first arg
         */
        wrap: function(method, fn) {
          var old = Atomic.proxy(this[method], this);
          var that = this;
          this[method] = function() {
            var args = [].slice.call(arguments, 0);
            args.unshift(old);
            return fn.apply(that, args);
          };
          return this;
        },
      
        /**
         * Proxy a function into a new scope.
         * @method AbstractComponent#proxy
         * @param {Function} fn - a function to proxy
         * @param {Object} scope - the scope to run the function in
         * @returns {Function}
         */
        proxy: function(fn, scope) {
          return function() {
            fn.apply(scope, arguments);
          };
        },

        /**
         * Attach an element to this Component
         * @method AbstractComponent#attach
         * @param {HTMLElement} el - an HTML element to attach
         * @returns this
         */
        attach: function (el) {
          this.assign('root', el);
          return this;
        },

        /**
         * get the root node
         * @method AbstractComponent#getRoot
         * @returns {HTMLElement}
         */
        getRoot: function () {
          return this.elements().root;
        },
      
        /**
         * Provides a helper for Block__Element--Modifier syntax
         * We use BEM internally in the objects in order to provide a consistent way to
         * manage CSS classes. The BEM helper creates class names in BEM syntax style
         * @method AbstractComponent#BEM
         * @param {String} element - the element part of the BEM syntax or null
         * @param {String} modifier - the modifer part of the BEM syntax or null
         * @returns {String}
         */
        BEM: function(element, modifier) {
          var className = this.id.replace(/[^A-Z0-9\-\_]/gi, '-');
          if (element) {
            className += '__' + element;
          }
          if (modifier) {
            className += '--' + modifier;
          }
          return className;
        },
      
        /**
         * Add a class to an element, helper in case jQuery or such isn't available
         * @method AbstractComponent#addClass
         * @param {HTMLElement} el - the HTML element
         * @param {String} klass - the classname to add
         * @returns this
         */
        addClass: function(el, klass) {
          var className = el.className;
          if (!hasClass(el, klass)) {
            className += ' ' + klass.replace(/[^A-Z0-9\-\_]/gi, '-');
            className = className.replace(/^\s+|\s+$/g, '');
          }
          el.className = className;
          return this;
        },
      
        /**
         * Removes a class from an element, helper in case jQuery or such isn't available
         * @method AbstractComponent#removeClass
         * @param {HTMLElement} el - the HTML element
         * @param {String} klass - the classname to add
         * @returns this
         */
        removeClass: function(el, klass) {
          var className = el.className;
          className = className.replace(new RegExp('(?:^|\\s)' + klass.replace(INVALID_CLASS_CHARACTERS, '-') + '(?!\\S)', 'g') , '');
          className = className.replace(/^\s+|\s+$/g, '');
          el.className = className;
          return this;
        },
      
        /**
         * Wait for the async completion of a function
         * @see Atomic.when
         */
        when: function() {
          return Atomic.when.apply(Atomic, arguments);
        },
      
        /**
         * Wait for the async completion of a collection of functions
         * @see Atomic.whenAll
         */
        whenAll: function() {
          return Atomic.whenAll.apply(Atomic, arguments);
        },

        /**
         * Load the Component, resolve all dependencies
         * calls the ready method
         * @method AbstractComponent#load
         * @param {Object} cb - a callback to run when this is loaded
         */
        load: function (cb) {
          if (this.elements().root) {
            this.addClass(this.elements().root, this.BEM());
            this.addClass(this.elements().root, this.BEM(this.elements.root));
            this.addClass(this.elements().root, this.BEM(null, 'loading'));
          }
          var deferred = Atomic.deferred();
          var self = this;
          var fetch = [];
          var allDependencies = this.depends._.raw();
          var allResolvedDependencies = this.depends();
          var fetchLen;
        
          // only fetch things we don't have a resolved value for
          for (var i = 0, len = allDependencies.length; i < len; i++) {
            if (!allResolvedDependencies[allDependencies[i]]) {
              fetch.push(allDependencies[i]);
            }
          }

          Atomic.load.apply(Atomic, fetch)
          .then(function(values) {
            var wiringDeferred = Atomic.deferred(),
                promise,
                i,
                n;

            // populate values resolution into the this.depends()
            for (i = 0, fetchLen = fetch.length; i < fetchLen; i++) {
              self.depends._.set(fetch[i], values[i]);
            }

            // dynamically create promise chain
            promise = Atomic.when(self._init.call(self));

            // if there is a callback, we can then handle it
            // by attaching it to the end of the promise chain
            if (cb) {
              promise = promise.then(cb);
            }

            // set resolution for the internal promise
            promise.then(function() {
              wiringDeferred.fulfill();
            }, function(err) {
              wiringDeferred.reject(err);
            });

            // return the promise to the outer function
            // if we hit a throw(), it'll automatically bubble out
            // to the outer promise layer thanks to the promise chain
            // above
            return wiringDeferred.promise;
          })
          .then(function() {
            var els = self.elements._.raw();
            for (var name in els) {
              if (els.hasOwnProperty(name) && self.elements()[name]) {
                self.addClass(self.elements()[name], self.BEM(name));
              }
            }
            if (self.elements().root) {
              self.removeClass(self.elements().root, self.BEM(null, 'loading'));
            }
            deferred.fulfill();
          }, function(err) {
            if (self.elements().root) {
              self.removeClass(self.elements().root, self.BEM(null, 'loading'));
              self.addClass(self.elements().root, self.BEM(null, 'failed'));
            }
            deferred.reject(err);
          });

          return deferred.promise;
        },

        /**
         * Adds additional functions and properties to this Component
         * wiring is done in response to a load() call.
         * @method AbstractComponent#wire
         * @param {Function|Object|AbstractWiring} wiring - a functon to run in response to load(), or an object
         *  literal containing an init function to be executed with load(), and public methods
         *  to decorate the component instance
         */
        wire: function(wiring) {
          var name, nodesName, eventsName, i, len, properties, cleanName;
          var wrapsPre = /^[\[\]]/;
          var wrapsPost = /[\[\]]$/;
          var self = this;
        
          function noop() {
            return function() {};
          }
        
          function wrapInit(obj, fn) {
            obj.wrap('_init', function(prev) {
              prev();
              fn.call(obj);
            });
          }
        
          // if the wiring is a function and has the __atomic property, error
          // if just a function, it's an "init"
          // if it's an object, it's already a wiring ready to go
          if (typeof wiring === 'function') {
            if (wiring.__atomic) {
              throw new Error('Atomic Wirings must be configured (by invoking their function) and passing their return value into wire()');
            }
            properties = {
              init: wiring
            };
          }
          else {
            properties = wiring;
          }
        
          // iterate through the keys. For each key, handle it
          for (name in properties) {
            if (!properties.hasOwnProperty(name)) {
              continue;
            }
          
            cleanName = name.replace(wrapsPre, '').replace(wrapsPost, '');
          
            if (cleanName == '_init') {
              throw new Error('You cannot wire in "_init" as it\'s a reserved method. Please use "init" without the underscore.');
            }
          
            // events requires special handling as a property
            if (name === 'events') {
              for (eventsName in properties.events) {
                if (properties.events.hasOwnProperty(eventsName)) {
                  this.properties._.add(eventsName, properties.events[eventsName]);
                }
              }
              continue;
            }
          
            // the elements collection requires special handling, and doesn't overwrite
            // any elements that may have been already defined
            if (name === 'elements') {
              for (nodesName in properties.elements) {
                if (this.elements[nodesName]) {
                  continue; // we do not overwrite if the Implementor has defined
                }
                this.elements._.add(nodesName, properties.elements[nodesName]);
              }
              continue;
            }
          
            // the depends collection requires special handling
            if (name === 'depends') {
              for (i = 0, len = properties.depends.length; i < len; i++) {
                this.depends._.add(properties.depends[i]);
              }
              continue;
            }
          
            // by default, init is a wrapped function unless you turn on clobbering
            if (name === 'init' || cleanName === 'init') {
              // init methods are always done with wrapping unless disabled
              if (name === ']init[') {
                this._init = properties[name];
              }
              else {
                wrapInit(this, properties[name]);
              }
              continue;
            }
          
            if (typeof properties[name] === 'function') {
              if (!this[cleanName]) {
                this[cleanName] = noop();
              }

              // the default behavior is to clobber
              // however, if we are told to wrap, we will
              if (cleanName !== name) {
                if (name.indexOf('[') === 0) {
                  this.wrap(cleanName, properties[name]);
                }
              }
              else {
                this[cleanName] = properties[name];
              }
              continue;
            }
          }
          return this;
        },

        /**
         * Overloaded state function for setting and getting the state
         * @method AbstractComponent#state
         * @param {Object|String} Either the key to be retrieved or set, or an object
         *   literal representing the new state or an extension of the new state
         * @param {*} value - Either the value to be set, or a boolean specifying the object
         *   in arg[0] should overwrite the existing state
         */
        state: function(one, two, undefined) {
          var args = [].slice.call(arguments, 0);
          var name;
          var values = {};
          var stateChanges = [];
          var newState = null;

          if (typeof args[1] === 'undefined') {
            if (typeof args[0] === 'undefined') {
              for (name in this._state) {
                if (this._state.hasOwnProperty(name)) {
                  values[name] = this._state[name].value;
                }
              }
              return values;
            }
            else if (typeof args[0] === 'string') {
              return this._state[args[0]].value;
            }
          }
        
          if(typeof args[0] === 'object') {
            for (name in args[0]) {
              if (args[0].hasOwnProperty(name)) {
                if (!this.states._.exists(name)) {
                  throw new Error('Invalid state: ' + name + '. Only states defined in this.states:{} may be set');
                }
                // overwrite if "true" or not set yet
                if (args[1]) {
                  // overwrite
                  this._state[name].rev++;
                  this._state[name].lastValue = this._state[name].value;
                  this._state[name].value = args[0][name];
                }
                else if (typeof this._state[name] === 'undefined') {
                  // never defined, new state object
                  this._state[name] = {
                    rev: 0,
                    value: args[0][name],
                    lastValue: undefined
                  };
                }
                
                stateChanges.push(name);
              }
            }
          }
        
          if (typeof args[0] === 'string') {
            if (!this.states._.exists(args[0])) {
              throw new Error('Invalid state: ' + args[0] + '. Only states defined in this.states:{} may be set');
            }
            if (typeof this._state[args[0]] === 'undefined') {
              this._state[args[0]] = {
                rev: 0,
                value: args[1],
                lastValue: undefined
              };
            }
            else {
              this._state[args[0]].rev++;
              this._state[args[0]].lastValue = this._state[args[0]].value;
              this._state[args[0]].value = args[1];
            }
            stateChanges.push(args[0]);
          }
        
          // we should have a set of items in stateChanges we need to now trigger observer
          // changes for each changed item
          for (var i = 0, len = stateChanges.length; i < len; i++) {
            newState = this._state[stateChanges[i]];
            this._observableEmitter.emit(stateChanges[i], newState.value, newState.lastValue, newState.rev);
          }

          if(stateChanges.length > 0) {
            return this.render();
          }
        
          return this;
        },
      
        /**
         * Listen for data changes in the state
         * @method AbstractComponent#observe
         * @param {String} name - the data name
         * @param {Function} fn - the callback function
         */
        observe: function (name, fn) {
          if (name ===  '*') {
            this._observableEmitter.onAny(fn);
          }
          else {
            this._observableEmitter.on(name, fn);
          }
          return this;
        },

        /**
         * Remove a listener for data changes
         * @method AbstractComponent#unobserve
         * @param {String} name - the data name to remove callbacks from
         * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
         */
        unobserve: function (name, fn /* optional */) {
          if (name === '*') {
            if (!fn) {
              this._observableEmitter.offAll(name);
            }
            else {
              this._observableEmitter.offAny(fn);
            }
          }
          else {
            this._observableEmitter.off(name, fn);
          }
          return this;
        },

        /**
         * Can be overriden to apply the component's internal state to the DOM
         * @method render
         * @returns this
         */
        render: function() {
          return this;
        }
      };
    });
    
    Atomic._.AbstractComponent = AbstractComponent;
  }(Atomic));

  
  // --------------------------------------------------
  // MODULES
  // --------------------------------------------------
  /*global Atomic:true */
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
  (function(Atomic) {
    var emitter = new Atomic._.EventEmitter({
      wildcard: true,
      newListener: false,
      maxListeners: 20
    });

    Atomic.augment(Atomic.Events, {
      /**
       * Listen for events emitted by the global Atomic Object
       * @method Atomic.on
       * @param {String} name - the event name
       * @param {Function} fn - the callback function
       */
      on: function (name, fn) {
        emitter.on(name, fn);
        return Atomic;
      },

      /**
       * Remove an event added via on
       * @method Atomic#off
       * @param {String} name - the name to remove callbacks from
       * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
       */
      off: function (name, fn /* optional */) {
        emitter.off(name, fn);
        return Atomic;
      },

      /**
       * Listen to all events emitted from the global Atomic Object
       * @method Atomic#onAny
       * @param {Function} fn - a function to fire on all events
       */
      onAny: function (fn) {
        emitter.onAny(fn);
        return Atomic;
      },

      /**
       * Remove a listener from the "listen to everything" group
       * @method Atomic#offAny
       * @param {Function} fn - the callback to remove
       */
      offAny: function (fn) {
        emitter.offAny(fn);
        return Atomic;
      },

      /**
       * Queue a callback to run once, and then remove itself
       * @method Atomic#onOnce
       * @param {String} name - the event name
       * @param {Function} fn - the callback function
       */
      onOnce: function (name, fn) {
        emitter.onOnce(name, fn);
        return Atomic;
      },

      /**
       * Queue a callback to run X times, and then remove itself
       * @method Atomic#on
       * @param {String} name - the event name
       * @param {Number} count - a number of times to invoke the callback
       * @param {Function} fn - the callback function
       */
      onMany: function (name, count, fn) {
        emitter.onMany(name, count, fn);
        return Atomic;
      },

      /**
       * Remove all of the listeners from the given namespace
       * @method Atomic#offAll
       * @param {String} name - the event name
       */
      offAll: function (name) {
        emitter.offAll(name);
        return Atomic;
      },

      /**
       * set the maximum number of listeners the global Atomic Object can support
       * highly interactive pages can increase the base number,
       * but setting arbitrarily large numbers should be a performance
       * warning.
       * @method Atomic#setMaxListeners
       * @param {Number} count - the max number of listeners
       */
      setMaxListeners: function (count) {
        emitter.setMaxListeners(count);
        return Atomic;
      },

      /**
       * Get a list of all the current listeners
       * @method Atomic#listeners
       * @returns {Array}
       */
      listeners: function (name) {
        var anyListeners = emitter.listenersAny();
        var listeners = emitter.listeners(name);
        return listeners.concat(anyListeners);
      },

      /**
       * Trigger an event
       * This triggers the specified event string, calling all
       * listeners that are subscribed to it.
       * @method Atomic#trigger
       * @param {String} name - the event name
       * @param {Object} ... - any additional arguments to pass in the event
       */
      trigger: function () {
        var args = [].slice.call(arguments, 0);
        emitter.emit.apply(emitter, args);
        return Atomic;
      }
    });
  }(Atomic));

  /*global Atomic:true */
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

  (function(Atomic) {
    Atomic.augment(Atomic._, {
      /**
       * The Internal Factory function hides most of the logic
       * for creating Atomic Components. It's split out to keep the
       * interface separate from the Fiber integration
       * @method Atomic.Factory
       * @private
       * @see Atomic.Component
       */
      Factory: function(objLiteral) {
        // certain items are "reserved" and cannot be overridden in a wiring
        var reserved = {
          // these are "special" but are okay to set using wiring
          // we are calling them out for readability's sake
          // wiring has a special use case below
          'depends':        false,
          'elements':       false,
          'events':         false,
          'init':           true,
          '_init':          true,
          '_eventEmitter':  true,
          '_isDestroyed':   true
        };

        // currently, we aren't doing anything fancy here
        // fiber requires an object literal that defines the interface
        // and we create the interface from the object literal
        // provided. For every item, if it's not in our reserved list,
        // we place it onto the additionalMethods collection.
        //
        // We then create an init() method that puts the wiring value
        // as first on the stack of wiring items.
        //
        // When a component is created, the wirings are pulled in
        // and ran in order.
        var component = Atomic._.AbstractComponent.extend(function(base) {
          var additionalMethods = {};
          // add all other extras
          for (var name in objLiteral) {
            if (!objLiteral.hasOwnProperty(name) || reserved[name]) {
              continue;
            }
            additionalMethods[name] = objLiteral[name];
          }
          additionalMethods.init = function() {
            base.init.apply(this, arguments);
            if (typeof objLiteral.init === 'function') {
              this._init = objLiteral.init;
            }
          };

          return additionalMethods;
        });

        return component;
      }
    });
    
    Atomic.augment(Atomic, {
      /**
       * Creates an Atomic Component
       * An Atomic Component consists of the following items in its object literal:
       * depends - an array of dependencies required for this component
       * elements - an object literal of node name / purpose
       * events - an object literal of event name / purpose
       * wiring - a function or object literal compatible with AbstractComponent#wireIn
       * @method Atomic.Component
       * @param {Object} objLiteral - the object literal to create a component from
       * @return {Object} an object that extends AbstractComponent
       */
      Component: function(objLiteral) {
        return Atomic._.Factory(objLiteral);
      },
    
      Wiring: function(wiring) {
        wiring.__atomic = true;
        return wiring;
      }
    });
  }(Atomic));

  /*global Atomic:true */
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

  (function(Atomic) {
    Atomic.augment(Atomic, {
      loader: {
        init: function() {},
        register: function(id, exports) {
          Atomic._.modules[id] = exports;
        },
        load: function(deps) {
          var resolved = [];
          for (var i = 0, len = deps.length; i < len; i++) {
            if (!Atomic._.modules[deps[i]]) {
              throw new Error('Module ID is not defined: ' + deps[i]);
            }
            resolved.push(Atomic._.modules[deps[i]]);
          }
          return resolved;
        }
      }
    });
  }(Atomic));
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

  /*global Atomic:true */
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

  // this file sets the Atomic Version string at build time
  (function(Atomic) {
    Atomic.augment(Atomic, {
      version: '0.0.9-8-gecd85cb'
    });
  }(Atomic));

  // assign all the pieces to modules
  var defineCall = (typeof globalDefine == 'function' && globalDefine.amd) ? globalDefine : Atomic;
  defineCall('Atomic', [], function() { return Atomic; });
  defineCall('Atomic/Component', [], function() { return Atomic.Component; });
  defineCall('Atomic/Wiring', [], function() { return Atomic.Wiring; });
})(this, function() { return define; });