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

  var reserved = {'needs':1, 'nodes':1, 'events':1, 'wiring':1};

  // currently, we aren't doing anything fancy here
  var returnObj = Atomic._.AbstractComponent.extend(function(base) {
    return {};
  });

  var objProto = returnObj.prototype;

  Atomic.augment(objProto.needs, needs);
  Atomic.augment(objProto.nodes, nodes);
  Atomic.augment(objProto.events, events);

  // wiring loop
  for (var i = 0, len = wiring.length; i < len; i++) {
    Atomic._.AbstractComponent.prototype.wireIn.call(objProto, wiring[i], false);
  }

  // all public methods, properties, etc
  for (name in objLiteral) {
    if (reserved[name]) {
      continue;
    }
    objProto[name] = objLiteral[name];
  }

  return returnObj;
};
