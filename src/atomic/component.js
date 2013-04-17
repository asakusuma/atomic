/*global Atomic:true */
(function() {
  // CONSTANTS
  var INIT = 'init',

  // private variables
  wiringInits = [];

  /**
  * factory method that returns a component class
  * @method Atomic.Component
  * @private
  */
  // TODO: need to extend AbstractComponent via Fiber
  Atomic.Component = function(config) {
    var wirings = config.wirings,
        n = 0,
        len = 0,
        key,
        constructor = function(el) {
          // run AbstractComponent initializer
          this.init(el);

          // set properties
          this.events = config.events || {};
          this.nodes = config.nodes || {};

          // run wiring initializers
          // TODO: this assumes sync wirings.  Need to incorporate Q promises
          len = wiringInits.length;
          for (n = 0; n<len; n++) {
            wiringInits[n].call(this);
          }
        };

    // process wirings.  This is done before the component
    // is initialized because the wirings will augment the component
    // prototype and builds the wiringInits array
    for (key in wirings) {
      _processWiring(constructor, wirings[key]);
    }

    return constructor;
  };

  /**
  * process a wiring object literal which contains method names and functions
  * as key value pairs.  The init key will be added to the wiringInits array, and then executed
  * when the component is instantiated.  All of the other methods will be added to
  * the constructor prototype
  * @method _processWiring
  * @param {Object} wiring object literal
  * @private
  */
  function _processWiring(constructor, wiring) {
    var key, method;

    for (key in wiring) {
      method = wiring[key];

      // run wire initializer
      if (key === INIT) {
        wiringInits.push(method);
      }

      // augment component methods
      else {
        constructor.prototype[key] = method;
      }
    }
  }
})();

