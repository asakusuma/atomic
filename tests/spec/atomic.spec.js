/*
 * @venus-Library mocha
 * @venus-include ../../tmp/atomic.js
 * @venus-fixure atomic.fixture.html
 */

describe('sanity check that Atomic is set up', function() {
  it('should have Atomic defined', function() {
    expect(Atomic).to.be.ok();
  });
});
