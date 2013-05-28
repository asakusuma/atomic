/*global describe:true, it:true, expect:true, AbstractComponent:true */
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
 * @venus-include ../../src/atomic.js
 * @venus-include ../../src/constants.js
 * @venus-include ../../src/atomic/events.js
 * @venus-include ../../src/atomic/abstractcomponent.js
 */

describe('Atomic AbstractComponent', function() {
  it('should exist', function() {
    expect(AbstractComponent).to.be.ok();
  });
});
