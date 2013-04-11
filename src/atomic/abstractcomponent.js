/*global Atomic:true */

/**
 * AbstractComponent a template for creating Components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and can be combined with additional
 * components to create Composites.
 * @class AbstractComponent
 */
var AbstractComponent = Atomic.OOP.extend({}, function (base) {
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
     * @property {Array} AbstractComponent#wiring
     */
    wiring: [],

    /**
     * The initializer for a component
     * The optional el, if provided, will then perform an attach on
     * your behalf.
     * @constructor
     * @param {HTMLElement} el - an optional HTML element
     */
    init: function (el, overrides) {
      if (el) {
        this.attach(el);
      }
    },

    /**
     * Destroy the object
     * @method AbstractComponent#destroy
     */
    destroy: function () {},

    /**
     * Listen for events emitted by the Component
     * @method AbstractComponent#on
     * @param {String} name - the event name
     * @param {Function} fn - the callback function
     */
    on: function (name, fn) {},

    /**
     * Remove an event added via on
     * @method AbstractComponent#off
     * @param {String} name - the name to remove callbacks from
     * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
     */
    off: function (name, fn /* optional */) {},

    /**
     * Listen to all events emitted from this Component
     * @method AbstractComponent#onAny
     * @param {Function} fn - a function to fire on all events
     */
    onAny: function (fn) {},

    /**
     * Remove a listener from the "listen to everything" group
     * @method AbstractComponent#offAny
     * @param {Function} fn - the callback to remove
     */
    offAny: function (fn) {},

    /**
     * Queue a callback to run once, and then remove itself
     * @method AbstractComponent#onOnce
     * @param {String} name - the event name
     * @param {Function} fn - the callback function
     */
    onOnce: function (name, fn) {},

    /**
     * Queue a callback to run X times, and then remove itself
     * @method AbstractComponent#on
     * @param {String} name - the event name
     * @param {Number} count - a number of times to invoke the callback
     * @param {Function} fn - the callback function
     */
    onMany: function (name, count, fn) {},

    /**
     * Remove all of the listeners from the given namespace
     * @method AbstractComponent#offAll
     * @param {String} name - the event name
     */
    offAll: function (name) {},

    /**
     * set the maximum number of listeners this component can support
     * highly interactive components can increase the base number,
     * but setting arbitrarily large numbers should be a performance
     * warning.
     * @method AbstractComponent#setMaxListeners
     * @param {Number} count - the max number of listeners
     */
    setMaxListeners: function (count) {},

    /**
     * Get a list of all the current listeners
     * @method AbstractComponent#listeners
     * @returns {Object}
     */
    listeners: function () {},

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
      var name = args.shift();
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
      var name = args.shift();
    },

    /**
     * Provides an easy way to link an event and method
     * @method AbstractComponent#bind
     * @param {Object} eventing - an eventing object
     * @param {String} eventName - the name of the event to listen to
     * @param {String|Function} method - the method to invoke. If a string, resolves under this.*
     */
    bind: function (eventing, eventName, method) {},

    /**
     * Remove a bind() operation
     * @method AbstractComponent#unbind
     * @param {Object} eventing - an eventing object
     * @param {String} eventName - optional. an event name to unsubscribe from
     * @param {String|Function} method - optional. the method to remove. If a string, resolves under this.*
     */
    unbind: function (eventing, eventName, method) {},

    /**
     * Attach an element to this Component
     * @method AbstractComponent#attach
     * @param {HTMLElement} el - an HTML element to attach
     */
    attach: function (el) {},

    /**
     * Detatch an element from this Component
     * @method AbstractComponent#detatch
     */
    detatch: function () {},

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
      // signature: next, needs, nodes
    },

    /**
     * Adds additional wiring commands to this Component
     * wiring is done in response to a load() call. An optional idx
     * can be provided, allowing you to insert your wiring wherever you
     * need to.
     * @method AbstractComponent#wireIn
     * @param {Function} fn - a functon to run in response to load
     * @param {Number} idx - optional. A 0-index slot for inserting the wiring
     */
    wireIn: function(fn, idx) {},

    /**
     * Add an additional event to this Component
     * @method AbstractComponent#addEvent
     * @param {String} name - the event name. Stored as NAME for usage
     */
    addEvent: function(name) {}
  };
});

if (module && module.exports) {
  module.exports = AbstractComponent;
}
