# About Atomic Source

## atomic/*
These files are folded into the main `atomic.js` file. Look for the matching `/* BEGIN */` and `/* END */` tags for the file, which is where they are inserted.

## compat/*
Contains compatibility with objects or items outside of the Atomic system. This is where library bridges may go if required, and it also includes the `configurator.js`, which sets of the dependency manager of choice.

## lib/*
Contains libraries external to Atomic, but are so fundamental, we must include them in the build.

## modules/*
Contains some sample modules which are copied to the release directory. Use them (or not), they are a powerful example of how you can begin rocking with Atomic.

## atomic.js
This file holds all the insertions from the `atomic/*` directory.

## config.js
Copied into the release directory, this is the `ATOMIC_CONFIG` used for setting up atomic to work with various systems. Pure JSON, written to a single variable.