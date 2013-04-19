/*global Atomic:true */

/**
 * AbstractComponent a template for creating Components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and can be combined with additional
 * components to create Composites.
 * @class AbstractComponent
 */
var AbstractComponent = Atomic._.Fiber.extend({}, function (base) {
  return {
    /**
     * A key/string collection of events
     * These are events that the AbstractComponent can emit
     * @property {Object} AbstractComponent#events
     */
    events: {},

    /**
     * A key/string collection of dependencies
     * These are modules that the AbstractComponent can emit
     * @property {Object} AbstractComponent#needs
     */
    needs: {},

    /**
     * A key/string collection of roles and matching nodes
     * These are nodes that compount components need to have in order to function
     * @property {Object} AbstractComponent#nodes
     */
    nodes: {},

    /**
     * An array of async functions, responsible for "wiring" everything together
     * This is where app logic resides
     * @property {Array} AbstractComponent#_inits
     * @private
     */
    _inits: [],

    /**
     * The initializer for a component
     * The optional el, if provided, will then perform an attach on
     * your behalf.
     * @constructor
     * @param {HTMLElement} el - an optional HTML element
     */
    init: function (el, overrides) {
      this._eventEmitter = new Atomic._.EventEmitter({
        wildcard: true,
        newListener: false,
        maxListeners: 20
      });
      if (el) {
        this.attach(el);
      }
    },

    /**
     * Destroy the object
     * @method AbstractComponent#destroy
     */
    destroy: function () {
      // TODO: akusuma
      // remove the el, set a flag that says this is destroyed
      // so erowell can stop wiring chain
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
        eventing.on(eventName, this[method]);
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

    // TODO: Doc and explain
    // replace an existing function with a new
    // method, then call the original method
    // if you got a function for arg 1, loop through
    // the this[] collection. Strings are far faster
    // as we can go write to wrapping
    before: function(method, fn) {
      // TODO: erowell
    },
    after: function(method, fn) {
      // TODO: erowell
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
      // get the needs keys, and Atomic.load them
      // make a copy of the wiring array
      // create continuation callback that...
      //   invokes the next element in the array with a new continuation callback
      //   if no next, then invoke cb()
      // call the first wiring w/ continuation function
      // signature: needs, nodes
      // TODO: jheuser
      return this;
    },

    /**
     * Adds additional wiring commands to this Component
     * wiring is done in response to a load() call. An optional idx
     * can be provided, allowing you to insert your wiring wherever you
     * need to.
     * @method AbstractComponent#wireIn
     * @param {Function|Object} fn - a functon to run in response to load, or an object
     *  literal containing an init function to be executed with load(), and public methods
     *  to decorate the generated component class
     * @param {Boolean} addFront if false, add the wiring to the end of the
     *  wirings array. If true, add the wiring at the beginning of the array.
     *  by default, addFront is false
     */
    wireIn: function(fn, addFront) {
      Atomic._.Factory.wireIn(this, fn, addFront);
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
