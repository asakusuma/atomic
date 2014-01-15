//global context:true, Atomic:true, Fiber:true */

// this is a venus fixture. When running pieces of the Atomic
// assembly, we need to look globally for variables
var context;

if (!context) {
  context = window;
}

if (!window.Atomic) {
  window.Atomic = function() {};
  Atomic.Events = {};
}

if (!Atomic._) {
  Atomic._ = {};
}

if (window.Fiber && !Atomic._.Fiber) {
  Atomic._.Fiber = Fiber;
}

if (window.EventEmitter2 && !Atomic._.EventEmitter) {
  Atomic._.EventEmitter = EventEmitter2;
}

context = context;