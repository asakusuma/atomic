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
  var needs = objLiteral.needs || {};
  var nodes = objLiteral.nodes || {};
  var events = objLiteral.events || {};
  var wiring = objLiteral.wiring || [];

  var reserved = {'needs':0, 'nodes':0, 'events':0, 'wiring':1};

  // currently, we aren't doing anything fancy here
  var component = Atomic._.AbstractComponent.extend(function(base) {
    var additionalMethods = {};
    // add all other extras
    for (var name in objLiteral) {
      if (!objLiteral.hasOwnProperty(name) || reserved[name]) {
        continue;
      }
      additionalMethods[name] = objLiteral[name];
    }
    additionalMethods.init = function() {
      base.init.apply(this, arguments);

      // this.needs = Atomic.augment(this.needs, needs);
      // this.nodes = Atomic.augment(this.nodes, nodes);
      // this.events = Atomic.augment(this.events, events);

      if (typeof wiring === 'function') {
        this.wireIn(wiring);
      }
      else if (Object.prototype.toString.call(wiring) === '[object Array]') {
        for (var i = 0, len = wiring.length; i < len; i++) {
          this.wireIn(wiring[i]);
        }
      }
    };

    return additionalMethods;
  });

  return component;
};
