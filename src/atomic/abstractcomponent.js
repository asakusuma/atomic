// abstract component

/**
 * AbstractComponent a template for creating components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and
 */
var AbstractComponent = Fiber.extend({}, function (base) {
  return {

    events: {},
    behaviors: {},

    has: [],
    hasResolved: {},

    init: function (el /* optional */) {},
    destroy: function () {},

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

    configure: function (definition, configuration) {},
    getConfiguration: function (definition) {},
    removeConfiguration: function (definition) {},

    augment: function (definition1, definition2..., callback) {},
    degrade: function(definition1, definition2..., callback) {},

    bind: function (eventing, eventName, method) {},
    unbind: function (eventing, eventName, method /* optional */) {}.

    attach: function (el) {},
    detatch: function () {}
    onAttach: function () {},
    onDetatch: function (el) {},
  };
});

