/*global asyncTest:true, ok:true, Atomic:true, start:true */
/*
 * @venus-library qunit
 * @venus-include ../../_resources/jquery-1.9.1.min.js
 * @venus-include ../../_resources/sinon.js
 * @venus-include ../../../dist/recent/atomic.js
 * @venus-include ../../../starter_pack/extras/atomic-test.js
 * @venus-include ../../../starter_pack/components/button.js
 */

module('starter pack button', {
  setup: function() {
    AMD.init();
    define.callsArgWith(2, Atomic.Component);
  },
  teardown: function() {
    AMD.restore();
  }
});
asyncTest('exists', 1, function() {
  AMD.run();
  var Button = AMD.exports[0];
  ok(Button, 'exists');
  start();
});

asyncTest('interaction', 1, function() {
  AMD.run();
  var Button = AMD.exports[0];
  
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
