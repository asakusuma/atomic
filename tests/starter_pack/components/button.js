/*global asyncTest:true, ok:true, Atomic:true, start:true */
/*
 * @venus-library qunit
 * @venus-include ../../_resources/jquery-1.9.1.min.js
 * @venus-include ../../../dist/recent/atomic.js
 * @venus-include ../../../starter_pack/extras/atomic-test.js
 * @venus-include ../../../starter_pack/components/button.js
 */
Atomic.Test.define('jquery', $);

module('starter pack button');
asyncTest('exists', 1, function() {
  Atomic.load('components/button')
  .then(Atomic.expand(function(Button) {
    ok(Button, 'exists');
    start();
  }))
  .then(null, function(e) {
    ok(false, e);
    start();
  });
});

asyncTest('interaction', 1, function() {
  Atomic.load('components/button')
  .then(Atomic.expand(function(Button) {
    $('body').append('<button id="yay">yay</button>');
    var button = new Button($('#yay').get(0));
    button.on(button.events.USE, function() {
      ok(true, 'button.events.USE');
    });
    button.load()
    .then(function() {
      $('#yay').trigger('click');
      start();
    });
  }));
});