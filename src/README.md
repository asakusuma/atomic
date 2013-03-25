# About Atomic Source

## atomic/*
These files are folded into the main `atomic.js` file. Their insertion points are identified by the `/* @@ INSERT constants.js */` string.

## compat/*
Contains compatibility with objects or items outside of the Atomic system. This is where library bridges may go if required, and it also includes the `configurator.js`, which sets of the dependency manager of choice.

## lib/*
Contains libraries external to Atomic, but are so fundamental, we must include them in the build. We are currently including
* Fiber - oop javascript system
* EventEmitter2 - event system

## modules/*
Contains some sample modules which are copied to the release directory. Use them (or not), they are a powerful example of how you can begin rocking with Atomic.

## atomic.js
This file holds all the insertions from the `atomic/*` directory.

## customizable/config.js
Copied into the release directory, this is the `ATOMIC_CONFIG` used for setting up atomic to work with various systems. Pure JSON, written to a single variable.