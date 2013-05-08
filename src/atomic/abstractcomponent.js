/*global Atomic:true */

// private functions
function addInit(obj, func, addFront) {
  if (addFront) {
    obj._inits.unshift(func);
  }
  else {
    obj._inits.push(func);
  }
}

/**
 * AbstractComponent a template for creating Components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and can be combined with additional
 * components to create Composites.
 * @class AbstractComponent
 */
var AbstractComponent = Atomic._.Fiber.extend(function (base) {
  return {
    /**
     * A simple ID to be overridden. Useful in debugging
     * @property {String} AbstractComponent#name
     */
    name: 'AbstractComponent. Override me to improve debugging',

    /**
     * A key/string collection of events
     * These are events that the AbstractComponent can emit
     * Overriden with an instance variable during the constructor
     * @property {Object} AbstractComponent#events
     */
    events: {},

    /**
     * An array of dependencies this module needs to run
     * These are modules the implementing component needs
     * @property {Array} AbstractComponent#needs
     */
    needs: [],

    /**
     * A key/string collection of roles and matching nodes
     * These are nodes that components need to have in order to function
     * Overriden with an instance variable during the constructor
     * @property {Object} AbstractComponent#nodes
     */
    nodes: {},

    // to be overriden on the instance level
    _inits: null,
    _eventEmitter: null,
    config: null,

    /**
     * The initializer for a component
     * The optional el, if provided, will then perform an attach on
     * your behalf.
     * @constructor
     * @param {HTMLElement} el - an optional HTML element
     */
    init: function (el, overrides) {
      var name, nodes, events;

      /**
       * An array of async functions, responsible for "wiring" everything together
       * This is where app logic resides
       * @property {Array} AbstractComponent#_inits
       * @private
       */
      this._inits = [];

      /** 
       * A configuration for this instance of the object
       * contains any unknown key/value pairs passed into the
       * constructor
       * @property {Object} AbstractComponent#config
       */
      this.config = {};

      // localize the nodes variable BEFORE the user starts configuring
      nodes = this.nodes;
      this.nodes = {};
      for (name in nodes) {
        if (nodes.hasOwnProperty(name)) {
          this.nodes[name] = nodes[name];
        }
      }

      // localize the events variable BEFORE the user starts configuring
      events = this.events;
      this.events = {};
      for (name in events) {
        if (events.hasOwnProperty(name)) {
          this.events[name] = events[name];
        }
      }

      // create an eventEmitter on this instance
      this._eventEmitter = new Atomic._.EventEmitter({
        wildcard: true,
        newListener: false,
        maxListeners: 20
      });

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
            // needs and events should be wired in. config is just silly
            continue;
          }
          else if (name === 'nodes') {
            // nodes are augmented
            this.nodes = Atomic.augment(this.nodes, overrides.nodes);
          }
          else {
            // everything else is assigned to config
            this.config[name] = overrides[name];
          }
        }
      }
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
     * Attach an element to this Component
     * @method AbstractComponent#attach
     * @param {HTMLElement} el - an HTML element to attach
     */
    attach: function (el) {
      this.nodes._root = el;
      return this;
    },

    /**
     * Load the Component, resolve all dependencies
     * calls the ready method
     * @method AbstractComponent#load
     * @param {Object} cb - a callback to run when this is loaded
     */
    load: function (cb) {
      // Question from Eric: why do we need to pass needs and nodes?  They
      // are accessible via this.needs and this.nodes from the wirings func

      // Reply from Jakob: this.needs isn't actually the resolved objects because
      // they are loaded at this step. We could overwrite this.needs, but that
      // could be confusing to the end developer who's trying to inspect the object

      var deferred = Atomic.deferred();
      var self = this;
      var nodes = {};

      for (var name in this.nodes) {
        if (this.nodes.hasOwnProperty(name)) {
          nodes[name] = this.nodes[name];
        }
      }

      Atomic.load(this.needs)
      .then(function(needs) {
        // dynamically create promise chain
        // inits[0] runs automatically
        var wiringDeferred = Atomic.deferred(),
            inits = self._inits,
            len = inits.length,
            promise = Atomic.when(inits[0].call(self, needs, nodes)),
            createWiringCall;

        // creates a call to a wiring function. Done outside of the
        // wiring for-loop
        createWiringCall = function(fn) {
          return function() {
            // run only on then() resolution to prevent premature
            // resolution of the promise chain
            fn.call(self, needs, nodes);
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
      var name;
      var nodesName;

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
            Atomic.augment(this.events, wiring[name]);
          }
          else if (name === 'nodes') {
            for (nodesName in wiring.nodes) {
              if (this.nodes[nodesName]) {
                continue; // we do not overwrite if the Implementor has defined
              }
              this.nodes[nodesName] = wiring.nodes[nodesName];
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
     * Add an additional event to this Component
     * @method AbstractComponent#addEvent
     * @param {String} name - the event name. Stored as NAME for usage
     */
    addEvent: function(name) {
      this.events[name] = name;
      return this;
    }
  };
});

if (module && module.exports) {
  module.exports = AbstractComponent;
}
