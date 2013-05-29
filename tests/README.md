Atomic Testing ReadMe
=====================
We are currently running a Venus.JS compatible framework for our tests
http://www.venusjs.org

In order to maintain compliance, we support only the following @venus annotation tags

* **@venus-include** this file will be included before the test is ran
* **@venus-library** we only support qunit right now, and will convert to mocha once we have venus support

Run All Tests
=============
Tests are ran via our gruntfile using the following command:

```
grunt test
```

To run a test via your web browser

```
grunt itest
```

and point your browser to http://localhost:4000/tests