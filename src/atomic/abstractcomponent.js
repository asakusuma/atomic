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

// private functions
function addInit(obj, func, addFront) {
  if (addFront) {
    obj._inits.unshift(func);
  }
  else {
    obj._inits.push(func);
  }
}

function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

// creates a displayable version of an object structure
// on component instantiation, this takes needs/nodes/events
// and turns them into usable objects
/*
component.events.USE => 'USE'
component.nodes.MyNode = document.blah
*/
function createDisplayable(obj, writeBack) {
  var type = (isArray(obj)) ? 'array' : 'object';
  var size = (type === 'array') ? obj.length : 0;
  var resolved = {};
  var name, i, len;
  var iface = function(key, to) {
    if (key && to) {
      return iface._.resolve(key, to);
    }
    return resolved;
  };
  iface.toString = function() {
    var out = [];
    var name, i;
    if (type === 'object') {
      for (name in obj) {
        if (obj.hasOwnProperty(name)) {
          out.push(name + ' (' + (resolved[name] ? 'R' : '?') + '): ' + obj[name]);
        }
      }
    }
    else {
      for (i = 0, len = obj.length; i < len; i++) {
        out.push('[' + i + '] (' + (resolved[obj[i]] ? 'R' : '?') + '): ' + obj[i]);
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
        obj.push(arguments[0]);
        size++;
      }
      else {
        obj[arguments[0]] = arguments[1];
        if (writeBack) {
          iface[arguments[0]] = arguments[0];
        }
      }
    },
    resolve: function(key, to) {
      resolved[key] = to;
    }
  };

  if (type === 'object') {
    for (name in obj) {
      if (obj.hasOwnProperty(name)) {
        iface._.resolve(name, null);
        if (writeBack) {
          iface[name] = name;
        }
      }
    }
  }
  else {
    for (i = 0, len = obj.length; i < len; i++) {
      iface._.resolve(obj[i], null);
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
     * @property {Array} AbstractComponent#needs
     */
    needs: [],

    /**
     * A key/string collection of nodes and their purpose
     * These are nodes that components need to have in order to function.
     * This object is overriden with an instance variable during the constructor
     * @property {Object} AbstractComponent#nodes
     */
    nodes: {},

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
      this.nodes = createDisplayable(this.nodes);
      this.events = createDisplayable(this.events, true);
      this.needs = createDisplayable(this.needs);

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
          else if (name === 'needs' || name === 'events' || name === 'config') {
            // needs and events should be wired in. using config for this is just silly
            continue;
          }
          else if (name === 'nodes') {
            for (nodeName in overrides.nodes) {
              if (overrides.nodes.hasOwnProperty(nodeName)) {
                this.nodes._.resolve(nodeName, overrides.nodes[nodeName]);
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
     * Assign a node to the component.nodes collection
     * @method AbstractComponent#assign
     * @param {String} name - the node to assign. Use a component.nodes reference
     * @param {HTMLElement} el - an element to assign to the role.
     */
    assign: function(name, el) {
      this.nodes._.resolve(name, el);
      return this;
    },

    /**
     * Destroy the object, removing DOM element and event bindings
     * @method AbstractComponent#destroy
     */
    destroy: function () {
      this._isDestroyed = true;
      this.offAny();
      if(this.nodes._root.parentNode) {
        this.nodes._root.parentNode.removeChild(this.nodes._root);
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
      return this.nodes()._root;
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

      Atomic.load(this.needs._.raw())
      .then(function(needs) {

        // populate needs resolution into the this.needs()
        var deps = self.needs._.raw();
        for (var i = 0, dlen = deps.length; i < dlen; i++) {
          self.needs._.resolve(deps[i], needs[i]);
        }

        // dynamically create promise chain
        // inits[0] runs automatically
        var wiringDeferred = Atomic.deferred(),
            inits = self._inits,
            len = inits.length,
            promise = Atomic.when(inits[0].call(self)),
            createWiringCall;

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
        for (var n = 1; n < len; n++) {
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
      var name, nodesName, eventsName;

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
          else if (name === 'nodes') {
            for (nodesName in wiring.nodes) {
              if (this.nodes[nodesName]) {
                continue; // we do not overwrite if the Implementor has defined
              }
              this.nodes._.add(nodesName, wiring.nodes[nodesName]);
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
     * Can be overriden to synchronize the DOM to the component's internal state
     * @method AbstractComponent#sync
     * @returns this
     */
    sync: function() {
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
