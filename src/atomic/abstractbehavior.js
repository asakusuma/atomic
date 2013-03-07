// abstract behavior

var AbstractBehavior = Fiber.extend({}, function (base) {
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

