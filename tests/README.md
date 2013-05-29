Atomic Testing ReadMe
=====================
Unit tests are run using Venus
http://www.venusjs.org

To set up your computer to use Venus, install PhantomJS globally:
```
> npm install -g phantomjs
```

Then, before testing, verify Venus is running correctly via a self check:
```
> ./node_modules/venus/bin/venus demo
```

Run All Tests
=============
Tests are ran via our gruntfile using the following command:

```
> grunt test
```

To run a specific test, run:
```
> ./node_modules/venus/bin/venus run -t [path to test file] -n
```

    "venus": "*",
    "phantomjs": "*",
    "mocha": "*",
    "expect": "*",