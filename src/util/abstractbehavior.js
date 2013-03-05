// abstract behavior

var Fiber = require('lib/fiber'),
    base = {},
    AbstractBehavior;

AbstractBehavior = Fiber.extend(base, function (base) {
  return {
    events: {},
    contract: {},

    init: function (component, configuration) {
      this.component = component;
      this.configuration = configuration;
    },
    trigger: function (eventName, arg1, arg2...) {},
    addMethod: function (name, fn) {},

    modify: function () {}
  };
});

module.exports = AbstractBehavior;
