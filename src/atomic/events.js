/*global Atomic:true */

var emitter = new Atomic._.EventEmitter({
  wildcard: true,
  newListener: false,
  maxListeners: 20
});

Atomic.Events = {};
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
    emitter.emit.apply(this._eventEmitter, args);
    return Atomic;
  }
});