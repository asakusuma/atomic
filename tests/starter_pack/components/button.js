/*global asyncTest:true, ok:true, Atomic:true, start:true */
/*
 * @venus-library qunit
 * @venus-include ../../../dist/recent/atomic.js
 * @venus-include ../../../dist/recent/compat/loaders/none.js
 * @venus-include ../../../starter_pack/components/button.js
 */

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