/*global asyncTest:true, ok:true, Atomic:true, start:true */
/*
 * @venus-library qunit
 * @venus-include ../_resources/jquery-1.9.1.min.js
 * @venus-include ../_resources/sinon.js
 * @venus-include ../../dist/recent/atomic.js
 */

var ATOMIC_LOAD_STUB;

// ======================================================================

module('creation of a component');

asyncTest('can create a component using factory method', 2, function() {
  var component = Atomic.Component({});
  ok(component, 'able to create a component');
  equal(typeof component, 'function', 'is a function');
  
  start();
});

// ======================================================================

module('managing this.elements', {
  setup: function() {
    ATOMIC_LOAD_STUB = sinon.stub(Atomic, 'load');
  },
  teardown: function() {
    Atomic.load.restore();
  }
});

asyncTest('can get a list of elements and assign them', 3, function() {
  var Component = Atomic.Component({
    elements: {
      'ONE': 'this is the description for item one',
      'TWO': 'item two has a decription listed here'
    }
  });

  var component = new Component();
  equal(typeof component.elements, 'function', 'is a callable function');
  equal(component.elements(component.elements.ONE), null, 'returns property in unresolved state');

  var el = document.createElement('div');
  component.assign(component.elements.ONE, el);
  equal(component.elements(component.elements.ONE), el, 'assigned element is the same');
  
  start();
});

// ======================================================================

module('managing this.depends', {
  setup: function() {
    var deferred = Atomic.deferred();
    deferred.resolve();

    ATOMIC_LOAD_STUB = sinon.stub(Atomic, 'load');
    ATOMIC_LOAD_STUB.returns(deferred.promise);
  },
  teardown: function() {
    Atomic.load.restore();
  }
});

asyncTest('can get a list of dependencies and they are loaded with atomic.load', 4, function() {
  var Component = Atomic.Component({
    depends: ['one', 'two']
  });

  var component = new Component();
  equal(typeof component.depends, 'function', 'is a callable function');

  equal(component.depends('one'), null, 'first dependency is unresolved');
  equal(component.depends('two'), null, 'second dependency is unresolved');

  var deferred = Atomic.deferred();
  deferred.resolve();
  ATOMIC_LOAD_STUB.withArgs('one', 'two').returns(deferred.promise);

  component.load();
  
  ok(ATOMIC_LOAD_STUB.withArgs('one', 'two').calledOnce, 'Atomic.load was called with one/two as arguments');
  start();
});

asyncTest('manually resolved dependencies are not passed to Atomic.load', 2, function() {
  var Component = Atomic.Component({
    depends: ['one', 'two']
  });
  
  var component = new Component();
  var oneDep = {};
  component.resolve('one', oneDep);
  
  equal(component.depends('one'), oneDep, 'first dependency is manually resolved');
  
  var deferred = Atomic.deferred();
  deferred.resolve();
  ATOMIC_LOAD_STUB.withArgs('two').returns(deferred.promise);
  
  component.load();
  
  ok(ATOMIC_LOAD_STUB.withArgs('two').calledOnce, 'Atomic.load was called with only the missing argument');
  
  start();
});

// ======================================================================

module('event API');
asyncTest('sanity test for on/off/emit', 2, function() {
  var callCount = 0;
  var Component = Atomic.Component({
    events: {
      'TEST': 'tests successfully'
    }
  });
  var component = new Component();
  
  var callCountUp = function() {
    callCount++;
    equal(callCount, 1, 'event fired successfully');
  };
  
  component.on(component.events.TEST, callCountUp);
  component.trigger(component.events.TEST);
  component.off(component.events.TEST, callCountUp);
  component.trigger(component.events.TEST);
  
  equal(callCount, 1, 'event triggered only once. does not re-fire after removed with off()');
  
  window.setTimeout(function() {
    // must be on next-tick
    start();
  });
  
});

// ======================================================================

module('verification of observer functionality');
asyncTest('observable events triggered using state', 3, function() {
  var Component = Atomic.Component({
    init: function() {
      this.state({
        foo: 3
      });
    }
  });

  var foo = new Component();
  foo.load()
  .then(function() {
    foo.observe('foo', function(newV, oldV, rev) {
      equal(newV, 5, 'new value exists');
      equal(oldV, 3, 'old value exists');
      equal(rev, 1, 'revision set');
      start();
    });
    foo.state('foo', 5);
  }, Atomic.e)
  .then(null, Atomic.e);
});