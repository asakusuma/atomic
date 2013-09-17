/*global asyncTest:true, ok:true, Atomic:true, start:true */
/*
 * @venus-library qunit
 * @venus-include ../../_resources/jquery-1.9.1.min.js
 * @venus-include ../../../dist/recent/atomic.js
 * @venus-include ../../../starter_pack/extras/atomic-test.js
 * @venus-include ../../../starter_pack/components/button.js
 */

module('starter pack button');
asyncTest('exists', 1, function() {
  var Button = Atomic.Test.getPack('components/button');
  
  ok(Button, 'exists');
  start();
});

asyncTest('interaction', 1, function() {
  var Button = Atomic.Test.getPack('components/button');
  
  $('body').append('<button id="yay">yay</button>');
  var button = new Button($('#yay').get(0));
  button.on(button.events.USE, function() {
    ok(true, 'button.events.USE');
  });
  
  // inject jquery explicitly
  button.resolve('jquery', $);
  
  button.load()
  .then(function() {
    $('#yay').trigger('click');
    start();
  });
});
