# About Atomic Source

## atomic/*
These files are folded into the main `atomic.js` file. Their insertion points are identified by the `//@@insert(.....)` string.

## compat/*
Many parts of Atomic are customizable to work with existing infrastructure. This is where you can augment Atomic's various libraries such as AMD/CJS loaders.

## lib/*
Contains libraries external to Atomic, but are so fundamental, we must include them in the build. We are currently including
* Fiber - oop javascript system
* EventEmitter2 - event system
* When - Promises

## atomic.js
This file holds all the insertions from the `atomic/*` directory.
