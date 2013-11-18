/*global asyncTest:true, ok:true, Atomic:true, start:true */
/*
 * @venus-library qunit
 * @venus-include ../../_resources/jquery-1.9.1.min.js
 * @venus-include ../../_resources/sinon.js
 * @venus-include ../../../dist/recent/atomic.js
 * @venus-include ../../../tmp/lib/redefine/redefine.js
 * @venus-include ../../../starter_pack/components/button.js
 */

redefine().save.as('button')
.let('Atomic/Component').be(Atomic.Component);

module('starter pack button', {
  setup: function() {},
  teardown: function() {}
});
asyncTest('exists', 1, function() {
  var Button = redefine.exports('button');
  ok(Button, 'exists');
  start();
});

asyncTest('interaction', 1, function() {
  var Button = redefine.exports('button');
  
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
