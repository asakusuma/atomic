/*global Atomic:true */

// Composite Factory
Atomic.Composite = function(objLiteral) {
  // needs, nodes, events, and wiring
  var name;
  var needs = objLiteral.needs || {};
  var nodes = objLiteral.nodes || {};
  var events = objLiteral.events || {};
  var wiring = objLiteral.wiring || [];

  // currently, we aren't doing anything fancy here
  var composite = Atomic._.Fiber.extend(Atomic._.AbstractComponent, function(base) {
    return {};
  });

  var cProto = composite.prototype;

  Atomic.augment(cProto.needs, needs);
  Atomic.augment(cProto.nodes, nodes);
  Atomic.augment(cProto.events, events);

  cProto._wirings = cProto._wirings.concat(wiring);

  return composite;
};