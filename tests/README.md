TODO for akusuma

1. test directory structure (can test by file)
2. Add basic mocha tests (atomic exists, etc)
3. Tests can be ran from gruntfile (jchan)

Atomic Testing ReadMe
=====================

Unit tests are run using Venus
http://www.venusjs.org

To run all the tests, run:
> venus run -t spec/ -n

To run a specific test, run:
> venus run -t spec/[MyTestName].spec.js -n

For instance, to run the Factory test, run:
> venus run -t spec/factory.spec.js -n

Test commands should be run from the tests/ directory