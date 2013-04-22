/*
 * @venus-Library mocha
 * @venus-include ../../src/atomic/public.js
 */

describe('Atomic Public API', function() {
  it('should have noConflict', function() {
    expect(Atomic.noConflict).to.be.ok();
  });
});
