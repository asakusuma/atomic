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
  var needs = objLiteral.needs || {};
  var nodes = objLiteral.nodes || {};
  var events = objLiteral.events || {};
  var wiring = objLiteral.wiring || [];

  var reserved = {'needs':1, 'nodes':1, 'events':1, 'wiring':1, 'init':1};

  // currently, we aren't doing anything fancy here
  var returnObj = Atomic._.AbstractComponent.extend(function(base) {
    var extraMethods = {};
    for (var name in objLiteral) {
      if (!objLiteral.hasOwnProperty(name) || reserved[name]) {
        continue;
      }
      extraMethods[name] = objLiteral[name];
    }

    extraMethods.init = function() {
      base.init.apply(this, arguments);
      Atomic.augment(this.needs, needs);
      Atomic.augment(this.nodes, nodes);
      Atomic.augment(this.events, events);

      if (typeof wiring === 'function') {
        this.wireIn(wiring);
      }
      else {
        for (var i = 0, len = wiring.length; i < len; i++) {
          this.wireIn(wiring[i]);
        }
      }
    };

    return extraMethods;
  });

  return returnObj;
};
