// abstract component

var Fiber = require('lib/fiber'),
    base = {},
    AbstractComponent;

AbstractComponent = Fiber.extend(base, function (base) {
  return {
    events: {},
    behaviors: {},
    subComponents: [],
    components: {},

    init: function (el /* optional */) {},
    destroy: function () {},

    onAttach: function () {},
    onRemove: function () {},

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

    add: function (namespace /* optional */, behavior, options /* optional */) {},
    remove: function (namespace /* optional */, behavior /* optional */) {},

    bind: function (eventing, eventName, method) {},
    unbind: function (eventing, eventName, method /* optional */) {}.

    attach: function () {},
    detatch: function (el) {}
  };
});

module.exports = AbstractComponent;
