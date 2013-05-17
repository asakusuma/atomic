/*global describe:true, it:true, expect:true, Atomic:true */

/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

/*
 * @venus-Library mocha
 * @venus-fixure atomic.fixture.html
 */

describe('sanity check that Atomic is set up', function() {
  it('should have Atomic defined', function() {
    expect(Atomic).to.be.ok();
  });
});
