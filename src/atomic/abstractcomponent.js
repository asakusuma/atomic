// abstract component

/**
 * AbstractComponent a template for creating components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and
 */
var AbstractComponent = Fiber.extend({}, function (base) {
  return {
    // the element bound to this object
    ELEMENT: null,

    // the events this component can emit
    events: {},
    
    // behaviors this component supports
    behaviors: {},

    // composition dependencies. This "has" the following
    // on load, resolved versions of these are passed to onAttach
    has: {},

    // constructor, destructor
    init: function (el /* optional */) {},
    destroy: function () {},

    // event system
    on: function (name, fn) {},
    off: function (name, fn /* optional */) {},
    onAny: function (fn) {},
    offAny: function (fn) {},
    onOnce: function (name, fn) {},
    onMany: function (name, count, fn) {},
    offAll: function (name) {},
    setMaxListeners: function (count) {},
    listeners: function () {},
    trigger: function (eventString, arg1, arg2...) {},
    bind: function (eventing, eventName, method) {},
    unbind: function (eventing, eventName, method /* optional */) {}.

    // behavior management
    configure: function (definition, configuration) {},
    getConfiguration: function (definition) {},
    removeConfiguration: function (definition) {},
    augment: function (definition1, definition2..., callback) {},
    degrade: function(definition1, definition2..., callback) {},

    // dom EL management
    attach: function (el) {},
    detatch: function () {}
    
    // overridable EL management resolution: a components "onReady" if you will
    onAttach: function (resolved) {},
    onDetatch: function (el) {},
  };
});

