/*
 * @venus-Library mocha
 * @venus-fixure atomic.fixture.html
 */

describe('sanity check that Atomic is set up', function() {
  it('should have Atomic defined', function() {
    expect(Atomic).to.be.ok();
  });
});
