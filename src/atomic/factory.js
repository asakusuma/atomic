/*global Atomic:true */

Atomic.Component = function(objLiteral) {
  return Atomic._.Factory(objLiteral);
};

Atomic.Composite = function(objLiteral) {
  return Atomic._.Factory(objLiteral);
};

// Composite Factory
Atomic._.Factory = function(objLiteral) {
  // needs, nodes, events, and wiring
  var name;
  var current;
  var extraMethods = {};
  var needs = objLiteral.needs || {};
  var nodes = objLiteral.nodes || {};
  var events = objLiteral.events || {};
  var wiring = objLiteral.wiring || [];

  var reserved = {'needs':0, 'nodes':0, 'events':0, 'wiring':1, 'init':1};

  // currently, we aren't doing anything fancy here
  var component = Atomic._.AbstractComponent.extend(function(base) {
    return {
      init: function() {
        base.init.apply(this, arguments);

        if (typeof wiring === 'function') {
          this.wireIn(wiring);
        }
        else if (wiring) {
          for (var i = 0, len = wiring.length; i < len; i++) {
            this.wireIn(wiring[i]);
          }
        }
      }
    };
  });

  // add all other extras
  for (name in objLiteral) {
    if (!objLiteral.hasOwnProperty(name) || reserved[name]) {
      continue;
    }
    extraMethods[name] = objLiteral[name];
  }
  Atomic._.Fiber.mixin(component, function(base) {
    return extraMethods;
  });

  return component;
};
