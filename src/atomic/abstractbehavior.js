// abstract behavior

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
var AbstractBehavior = Fiber.extend({}, function (base) {
  return {
    // the element. Auto-attached during construction
    ELEMENT: null,
    
    /**
     * A key/string collection of events
     * events in a Behavior are namespaced onto the parent
     * component under objName.events.NAMESPACE.key
     */
    events: {},

    /**
     * A key/function collection of methods to attach to the component
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
     */
    contract: {},

    /**
     * Initialize the Behavior
     * @param {Object} component - the component we are augmenting
     * @param {Object} configuration - the object we are configuring with
     * @param {String} signature - a unique string signature for events and methods
     */
    init: function (component, configuration, signature) {
      this.component = component;
      this.configuration = configuration;

      // verify contract, throw exception if required
      // the invoke modify()
    },

    /**
     * Calls the namespaced version of the trigger() method
     * on the hosting component
     * @method AbstractBehavior#trigger
     * @param {String} eventName - the event name to trigger
     * @param {Object} arg1 - a sequential set of arguments for the event
     */
    trigger: function (eventName, arg1, arg2...) {},

    /**
     * modify the host component. Invoked after a contract is fulfilled
     * and the host object is successfully augmented
     * @method AbstractBehavior#modify
     * @param {Function} done - an async callback triggered when modification is complete
     */
    modify: function (done) {
      done();
    }
  };
});

