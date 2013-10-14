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
 * Add an initialization function to an instance object
 * this places the function onto the _inits property
 * of the instance, and can optionally put it at the front
 * of the init collection
 * @method AbstractComponent.addInit
 * @private
 * @param {Object} obj - the object to augment with a new init
 * @param {Function} func - the function to add to obj
 * @param {Boolean} addFront - if true, the Func is placed at the front
 */
function addInit(obj, func, addFront) {
  if (addFront) {
    obj._inits.unshift(func);
  }
  else {
    obj._inits.push(func);
  }
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
 * @method AbstractComponent.createDisplayable
 * @private
 * @param {Object} obj - the object to convert
 * @param {Boolean} writeBack - if true, properties are also stored on the returned object
 * @param {Boolean} preResolved - if true, no resolution of the object is used. The keys become values
 * @returns {Object} a function/object combination wtih the above methods
 */
function createDisplayable(obj, writeBack, preResolved) {
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
/**
 * AbstractComponent a template for creating Components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and can be combined with additional
 * components to create Composites.
 * @class AbstractComponent
 */
var __Atomic_AbstractComponent__ = Atomic._.Fiber.extend(function (base) {
  return {
    /**
     * A simple ID to be overridden. Useful in debugging
     * @property {String} AbstractComponent#name
     */
    name: 'AbstractComponent. Override me to improve debugging',

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
     * A configuration for this instance of the object
     * contains any unknown key/value pairs passed into the
     * constructor
     * @property {Object} AbstractComponent#config
     */
    config: {},

    /**
     * An array of async functions, responsible for "wiring" everything together
     * This is where app logic resides
     * @property {Array} AbstractComponent#_inits
     * @private
     */
    _inits: [],

    /**
     * A local event emitter
     * @property {EventEmitter} AbstractComponent#_eventEmitter
     * @private
     */
    _eventEmitter: null,

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

      // set inits, assigned, etc all to local instance-level variables
      this._inits = [];
      this.config = {};
      this._eventEmitter = new Atomic._.EventEmitter({
        wildcard: true,
        newListener: false,
        maxListeners: 20
      });

      // localize the nodes/events/needs variable BEFORE the user starts configuring
      // nodes and needs can accept overwriting
      this.elements = createDisplayable(this.elements, true);
      this.events = createDisplayable(this.events, true, true);
      this.depends = createDisplayable(this.depends);

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
      if(this.elements()._root.parentNode) {
        this.elements()._root.parentNode.removeChild(this.elements()._root);
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
      this._eventEmitter.on(name, fn);
      return this;
    },

    /**
     * Remove an event added via on
     * @method AbstractComponent#off
     * @param {String} name - the name to remove callbacks from
     * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
     */
    off: function (name, fn /* optional */) {
      this._eventEmitter.off(name, fn);
      return this;
    },

    /**
     * Listen to all events emitted from this Component
     * @method AbstractComponent#onAny
     * @param {Function} fn - a function to fire on all events
     */
    onAny: function (fn) {
      this._eventEmitter.onAny(fn);
      return this;
    },

    /**
     * Remove a listener from the "listen to everything" group
     * @method AbstractComponent#offAny
     * @param {Function} fn - the callback to remove
     */
    offAny: function (fn) {
      this._eventEmitter.offAny(fn);
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
     * Queue a callback to run X times, and then remove itself
     * @method AbstractComponent#on
     * @param {String} name - the event name
     * @param {Number} count - a number of times to invoke the callback
     * @param {Function} fn - the callback function
     */
    onMany: function (name, count, fn) {
      this._eventEmitter.onMany(name, count, fn);
      return this;
    },

    /**
     * Remove all of the listeners from the given namespace
     * @method AbstractComponent#offAll
     * @param {String} name - the event name
     */
    offAll: function (name) {
      this._eventEmitter.offAll(name);
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
      this._eventEmitter.emit.apply(this._eventEmitter, args);
      return this;
    },

    /**
     * Broadcast a global event
     * Trigger an event on the global event bus
     * @method AbstractComponent#broadcast
     * @param {String} name, the event name
     * @param {Object} ... - any additional arguments to pass in the event
     */
    broadcast: function () {
      var args = [].slice.call(arguments, 0);
      Atomic.trigger.apply(Atomic, args);
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
     * augment a method by executing a custom function before executing a method
     * @method AbstractComponent#before
     * @param {String} method - method to augment
     * @param {Function} fn - custom function to execute before executing the method
     */
    before: function(method, fn) {
      var old = this[method];
      var that = this;
      this[method] = function() {
        fn.apply(that, arguments);
        old.apply(that, arguments);
      };
      return this;
    },

    /**
     * augment a method by executing a custom function after executing a method
     * @method AbstractComponent#before
     * @param {String} method - method to augment
     * @param {Function} fn - custom function to execute after executing the method
     */
    after: function(method, fn) {
      var old = this[method];
      var that = this;
      this[method] = function() {
        old.apply(that, arguments);
        fn.apply(that, arguments);
      };
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
        fn.apply(that, args);
      };
      return this;
    },

    /**
     * Attach an element to this Component
     * @method AbstractComponent#attach
     * @param {HTMLElement} el - an HTML element to attach
     */
    attach: function (el) {
      this.assign('_root', el);
      return this;
    },

    /**
     * get root node
     * @method AbstractComponent#getRoot
     */
    getRoot: function () {
      return this.elements()._root;
    },

    /**
     * Load the Component, resolve all dependencies
     * calls the ready method
     * @method AbstractComponent#load
     * @param {Object} cb - a callback to run when this is loaded
     */
    load: function (cb) {
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
            inits,
            len,
            promise,
            createWiringCall,
            i,
            n;


        // populate values resolution into the this.depends()
        for (i = 0, fetchLen = fetch.length; i < fetchLen; i++) {
          self.depends._.set(fetch[i], values[i]);
        }

        // dynamically create promise chain
        // inits[0] runs automatically
        inits = self._inits;
        len = inits.length;
        promise = Atomic.when(inits[0].call(self)),

        // creates a call to a wiring function. Done outside of the
        // wiring for-loop
        createWiringCall = function(fn) {
          return function() {
            // run only on then() resolution to prevent premature
            // resolution of the promise chain
            fn.call(self);
          };
        };

        // replace itself with a new promise
        for (n = 1; n < len; n++) {
          promise = promise.then(createWiringCall(inits[n]));
        }

        // if there is a callback, we can then handle it
        // by attaching it to the end of the promise chain
        if (cb) {
          promise = promise.then(cb);
        }

        // set resolution for the internal promise
        promise.then(function() {
          wiringDeferred.resolve();
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
        deferred.resolve();
      }, function(err) {
        deferred.reject(err);
      });

      return deferred.promise;
    },

    /**
     * Adds additional wiring commands to this Component
     * wiring is done in response to a load() call. An optional idx
     * can be provided, allowing you to insert your wiring wherever you
     * need to.
     * @method AbstractComponent#wireIn
     * @param {Function|Object} wiring - a functon to run in response to load(), or an object
     *  literal containing an init function to be executed with load(), and public methods
     *  to decorate the component instance
     * @param {Boolean} addFront - if false, add the wiring to the end of the
     *  wirings array. If true, add the wiring to the beginning of the array.
     *  by default, addFront is false
     */
    wireIn: function(wiring, addFront) {
      var name, nodesName, eventsName, i, len;

      // wiring can be set to a single function which defaults
      // to an initializer
      if (typeof wiring === 'function') {
        addInit(this, wiring, addFront);
      }
      // wiring can also be an object literal.  In this case, iterate through
      // the keys, add the init function, and append the other methods to the
      // class prototype
      else {
        for (name in wiring) {
          if (name === 'events') {
            // TODO: Broken
            for (eventsName in wiring.events) {
              if (wiring.events.hasOwnProperty(eventsName)) {
                this.events._.add(eventsName, wiring.events[eventsName]);
              }
            }
          }
          else if (name === 'elements') {
            for (nodesName in wiring.elements) {
              if (this.elements[nodesName]) {
                continue; // we do not overwrite if the Implementor has defined
              }
              this.elements._.add(nodesName, wiring.elements[nodesName]);
            }
          }
          else if (name === 'depends') {
            for (i = 0, len = wiring.depends.length; i < len; i++) {
              this.depends._.add(wiring.depends[i]);
            }
          }
          else {
            if (wiring.hasOwnProperty(name)) {
              if (name === 'init') {
                addInit(this, wiring[name], addFront);
              }
              else {
                this[name] = wiring[name];
              }
            }
          }
        }
      }
      return this;
    },

    /**
     * Takes an object literal and applies it to the state
     * @method toJSON
     * @param {Object} obj - the object literal representing the state
     */
    toJSON: function(obj) {
      if(typeof obj == 'object') {
        this.state = obj;
        this.render();
      }
    },

    /**
     * Returns the object literal representing the components state
     * @method toJSON
     * @returns {Object} object literal representing state
     */
    toJSON: function(obj) {
      var state = {};
      if(typeof this.state == 'object') {
        state = this.state;
      }
      return state;
    },

    /**
     * Can be overriden to apply the component's internal state to the DOM
     * @method render
     * @returns this
     */
    render: function() {
      return this;
    },

    /**
     * Can be overridden to update the component's internal state based on the
     * current DOM. This is really useful when you are pulling in content via
     * innerHTML, and want the component to reflect this new information
     * @method AbstractComponent#update
     * @returns this
     */
    update: function() {
      return this;
    }
  };
});

// for jshint
__Atomic_AbstractComponent__ = __Atomic_AbstractComponent__;
