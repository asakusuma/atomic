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
     * The element once attached, visible as this.ELEMENT throughout
     * @property {HTMLElement} AbstractComponent#ELEMENT
     */
    ELEMENT: null,

    /**
     * A key/string collection of events
     * These are events that the AbstractComponent can emit
     * @property {Object} AbstractComponent#events
     */
    events: {},

    /**
     * A key/object collection of behaviors
     * These identify various behaviors that the implemented
     * component supports.
     *
     * A behavior's object contains three properties, "namespace",
     * "path", and "object".
     *
     * namespace: a local name for the string to assist in namespacing
     * path: a path from the current component to the behavior
     * object: the behavior object (can be used in place of "path")
     *
     * SELECTED: {namespace: 'selected', path: 'module/path'}
     *
     * @property {Object} AbstractComponent#behaviors
     */
    behaviors: {},

    /**
     * The initializer for a component
     * The optional el, if provided, will then perform an attach on
     * your behalf.
     * @constructor
     * @param {HTMLElement} el - an optional HTML element
     */
    init: function (el) {
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
     * @param {String} - the event name
     * @param {Object} variable - any additional arguments to pass in the event
     */
    trigger: function () {
      var args = [].slice.call(arguments, 0);
    },

    /**
     * Confgure a behavior's binding object prior to augmentation
     * Every Behavior attached via augment() must fulfill a contract
     * in order to be successfully added. This contract looks at an
     * object literal and its properties. The configure() method does
     * its part by creating the configuration object needed at
     * augmentation time
     * @method AbstractComponent#configure
     * @param {Object} definition - the definition object for the behavior
     * @param {Object} configuration - the configuration to apply for a definition
     */
    configure: function (definition, configuration) {},

    /**
     * Remove a configuration object from this component
     * @method AbstractComponent#removeConfiguration
     * @param {Object} definition - a definition object to remove
     */
    removeConfiguration: function (definition) {},

    /**
     * Augment this Component with a Behavior
     * Using the mapping from the this.behaviors collection, one
     * or more Behaviors are loaded, and then their configurations
     * are checked. The end result is a Behavior modifying this
     * Component, adding Methods and Events to create new functionality.
     *
     * Augmenting is Asynchronous.
     *
     * @param {Object} variable - a number of augmentations to apply
     * @param {Function} callback - a callback function when all augments are done
     */
    augment: function () {
      var args = [].slice.call(arguments, 0);
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
      this.modify(cb);
    },

    /**
     * Triggers when an element is loaded.
     * @method AbstractComponent#onLoad
     * @param {Object} done - invoke this callback when the modifying is complete
     */
    modify: function (done) {}
  };
});


if (module && module.exports) {
  module.exports = AbstractComponent;
}
