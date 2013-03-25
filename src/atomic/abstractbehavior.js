/*global Atomic:true */

/**
 * AbstractBehavior a template for creating additional behaviors
 * Behaviors are ways to increase the abilities of instantiated
 * components. They can add, change, or replace functionality in
 * their host objects. In order to keep things simple, we
 * recommend only adding and augmenting the hosting component.
 *
 * On instantiation, a behavior's contract is checked for compliance
 * and if things are not okay, an exception is thrown.
 *
 * A hosting component will then absorb all methods in the methods{}
 * collection, adding them to the component.methods destination.
 * It will then add the events{} object to its own event collection.
 *
 * Methods absorbed are made available under
 * component.methods.NAMESPACE.methodName
 *
 * Events absorbed are made available under
 * component.events.NAMESPACE.eventKey
 *
 * @class AbstractBehavior
 */
var AbstractBehavior = Atomic.OOP.extend({}, function (base) {

  /**
   * Verify a contract is being fufilled for a given configuration
   * Iterate through the contract, checking each needed item
   * exists in the configuration, throwing an exception if a
   * condition is not met
   * @private
   * @method AbstractBehavior._verifyContract
   * @param {Object} contract - a contract to test
   * @param {Object} configuration - a configuration object to test against
   * @return {Boolean}
   * @throw {Error} throws if the contract is not fulfilled
   */
  var _verifyContract = function (contract, configuration) {
  };

  /**
   * Trigger an event from within a behavior
   * Each behavior is given a unique signature so that there are never
   * conflicts. This _triggerEvent abstraction adds the signature to
   * the requested event in order to namespace it.
   * @private
   * @method AbstractBehavior._triggerEvent
   * @param {AbstractBehavior} behavior - an abstract behavior subclass
   * @param {String} signature - the unique signature for this behavior
   * @param {Array} triggerArgs - the arguments called from the internal trigger()
   */
  var _triggerEvent = function (behavior, signature, triggerArgs) {
  };

  return {
    /**
     * A key/string collection of events
     * events in a Behavior are namespaced onto the parent
     * component under objName.events.NAMESPACE.key
     * @property {Object} AbstractBehavior#events
     */
    events: {},

    /**
     * A key/function collection of methods to attach to the component
     * similar to the events {} collection, the methods collection
     * denotes a series of methods to be attached to the host component
     *
     * methods are namespaced into objName.methods.NAMESPACE.key
     * @property {Object} AbstractBehavior#methods
     */
    methods: {},

    /**
     * A contract that the configuration object must abide by
     * this is almost like an interface for the this.configuration
     * object. If the contract is not fulfilled, an exception is
     * thrown, and the modify() method is not invoked
     *
     * Contract members are in the format of either
     * propertyName: required
     * propertyName: { required: true|false, type: 'TYPE' }
     * where "required" is a boolean, and in the object system,
     * the type parameter forces a typeof check.
     * @property {Object} AbstractBehavior#contract
     */
    contract: {},

    /**
     * Initialize the Behavior
     * @constructor
     * @param {Object} component - the component we are augmenting
     * @param {Object} configuration - the object we are configuring with
     * @param {String} signature - a unique string signature for events (used in trigger)
     * @throws {Error} invalid contracts can throw an error
     */
    init: function (component, configuration, signature) {
      _verifyContract(this.contract, configuration);

      this.component = component;
      this.configuration = configuration;

      var self = this;

      // this local trigger instance calls the static reference
      this.trigger = function() {
        var args = [].slice.call(arguments, 0);
        _triggerEvent(self, signature, args);
      };

      this.modify();
    },

    /**
     * modify the host component. Invoked after a contract is fulfilled
     * and the host object is successfully augmented
     * @method AbstractBehavior#modify
     * @param {Function} done - an asynchronous callback that triggers at the end of modification
     */
    modify: function (done) {
      done();
    }
  };
});

if (module && module.exports) {
  module.exports = AbstractBehavior;
}
