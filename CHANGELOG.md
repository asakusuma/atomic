<a name="v0.0.9"></a>
### v0.0.9 (2013-12-02)

<a name="v0.0.8"></a>
### v0.0.8 (2013-11-25)


#### Bug Fixes

* **AbstractComponent:** state correctly checks the states object ([4824b250](http://github.com/jakobo/atomic/commit/4824b25086bfffaee624d76ba842beae3d32672d))
* **examples:** Fixes a parseInt in page.js to use Radix parameter ([dffe0b49](http://github.com/jakobo/atomic/commit/dffe0b492df06db9927681423726b9b681ff13ea))
* **tests:** Requests for /atomic.js resolve correctly ([5d825aaf](http://github.com/jakobo/atomic/commit/5d825aafc4d38bbb323637257313901b3155a9eb))


#### Features

* **PublicAPI:** Adds powerful debugging features to Components ([35d90169](http://github.com/jakobo/atomic/commit/35d90169a191f333bd5c6b4d2250ce4d704e24ef))
* **grunt:** Ports Inject's grunt tooling to Atomic ([b804bebb](http://github.com/jakobo/atomic/commit/b804bebb1902504a4fe2321f528f3497f5b13493))


#### Breaking Changes

* In order to ensure documentation works as expected,
the following methods have had restrictions added:
* trigger: the event name must be specified in the component.events collection
* assign: the element property must be specified in component.elements
* resolve: the dependency must be specified in component.depends
* state: the state being set must be specified in component.states

This affects all components utilizing the trigger/assign/resolve/state methods
 ([35d90169](http://github.com/jakobo/atomic/commit/35d90169a191f333bd5c6b4d2250ce4d704e24ef))

