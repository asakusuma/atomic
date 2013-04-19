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
  var returnObj = Atomic._.Fiber.extend(Atomic._.AbstractComponent, function(base) {
    return {};
  });

  var objProto = returnObj.prototype;

  Atomic.augment(objProto.needs, needs);
  Atomic.augment(objProto.nodes, nodes);
  Atomic.augment(objProto.events, events);

  // wiring loop
  for (var i = 0, len = wiring.length; i < len; i++) {
    Atomic._.Factory.wireIn(objProto, wiring[i], false);
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

function addInit(obj, func, addFront) {
  if (addFront) {
    obj._inits.unshift(func);
  }
  else {
    obj._inits.push(func);
  }
}

Atomic._.Factory.wireIn(obj, wiring, addFront) {
  var name;

  // wiring can be set to a single function which defaults
  // to an initializer
  if (typeof wiring === 'function') {
    addInit(obj, wiring, addFront);
  }
  // wiring can also be an object literal.  In this case, iterate through
  // the keys, add the init function, and append the other methods to the
  // class prototype
  else {
    for (name in wiring) {
      if (wiring.hasOwnProperty(name)) {
        if (name === 'init') {
          addInit(obj, wiring[name], addFront);
        }
        obj[name] = wiring[name];
      }
    }
  }
};