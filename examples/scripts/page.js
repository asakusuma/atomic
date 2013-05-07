/*global Atomic:true, console:true */

// page.js file

// Button with Debug Tracer wiring
Atomic.load('components/button', 'wirings/debugtracer')
.then(Atomic.expand(function(Button, debugtracer) {
  // build the button and add echo wiring
  var button = new Button(document.getElementById('myButton'));
  button.wireIn(debugtracer());

  button.load()
  .then(function() {
    console.log('The Button with Debug Tracer wiring has loaded');
  }, Atomic.thrower);
}), Atomic.thrower);