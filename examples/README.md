# About the Examples

**Note** Long term, we should split these up into multiple tutorial items.

## atomic/*
In here, you can find a collection of Components and Composites that show how to build on top of Atomic.AbstractBehavior and Atomic.AbstractComponent. This would likely mirror the structure of your own code. These are very minimalist examples.

* atomic/components/carousel.js - a sample Components, the "Carousel"
* atomic/components/button.js - a sample Component, the "Button"

* composites/carouselwithbuttons.js - a sample Composite, combining a "Carousel" and a "Button" into a single reusable object that depends on DOM structure.

We plan to eventually launch a bootstrapping collection of Components and Composites. It has no name yet, but it is designed to be like the [Jeesh of Ender](https://github.com/ender-js/jeesh)

## The pojs_* files
The Plain Old JavaScript (POJS) interfaces show how you would use regular ole JavaScript with Atomic Components to accomplish your UI goals. While these examples are written for jQuery, they could easily work with Backbone, with Zepto, or really any JavaScript library (or no JS library!). You're only limited by the Components, Composites, and Behaviors you choose to include.

## composite_* files
The Composition API (Comps) shows how as an end developer, you would use a Composite. Since a Composite requires multiple "actors", you add them using the built in .composite.ACTORS behavior. These actors fulfill their roles in the Composite, and the composite will do whatever it needs to with those elements in order to build our your final object.

## wiring_* files
For both Components and Composites, additional and custom wiring can be added to provide new functionality. The wiring_* files show both a pre existing wiring and some custom wiring being added to a stock Carousel.

## html_* files
The Atomic HTML Interface (AHI) is a plugin that when used allows you to scan your HTML for Atomic Components and Composites, creating them on demand. If you just want to write markup and have magic happen, perhaps this is for you. For users of JS frameworks, this is probably less desirable, and you may wish to fall back to the Comps or POJS interfaces.

# Layers
To keep everything cohesive, think of the Atomic ecosystem like this:

* The AHI (Atomic HTML Interface) is just a HTML scanner that makes use of
* The Composition interface to put together Components
* All of which are created using an obvious Plain Old JavaScript (POJS)

# How do I build a Component?
The following template can be used as a guide for creating a Component:

```js
function factory() {
  var $ = require('jquery');
  var Atomic = require('atomic');
  return Atomic.Component({
    needs: {},
    nodes: {},
    events: {},
    wiring: [],
    publicMethodOne: function() {},
    publicMethodTwo: function() {}
  });
}
factory.id = 'sampleTemplate';

Atomic.export(module, define, factory);
```

So what's going on here?

1. The `factory` function allows you to create a local scope for all your require() statements. In non-commonJS environments, this can also help you avoid putting things into the window scope. This module depends on `jquery` and the `Atomic` library.
2. The `Atomic.Component` creates a new Atomic Component. On the backend, the `needs`, `actors`, `events`, and `wiring` are added.
  * `needs` is the dependencies this component relies on `needs: { FooComponent: 'path/to/foo/component' }`
  * `actors` are any additional HTML nodes required for this Component `actors: { Foo: null, Bar: null, Baz: null }`
  * `events` is a collection of events this object can generate `events: { SELECT: 'select' }`
  * `wiring` is an array of functions to run in order to initialize the object. Every function receives three parameters: **next** (continues to the next wiring item), **needs** (a resolved collection of the needs object above), and **actors** (all actors that were defined on instantiation).
4. Return the object created from `Atomic.Component`, completing the factory method
5. Calling `Atomic.export` saves your Component into the proper namespace. If you gave your factory an `id`, it will make use of a global registry.

# How do I build a Composite?
It's actually the same! "Composite" is just an organizational term. If you're using the `has:{}` or `actors:{}` properties, you should probably consider your object a composite. This helps consuming developers know how complex your object is.

Just use `Atomic.Composite({})` to create the composite. If the need arises, Composites may gain additional features that Components don't have.

# Reusable Wirings
Wirings are reusable ways to add additional behaviors to an existing Atomic Component or Composite. Stick them in the `wirings` directory, include them via `Atomic.load`, and pass them as a parameter to `instanceObject.wireIn()`. Just like that, your reusable wiring will run at the end of the chain.

Want to make it run first? `instanceObject.wireIn(function, true)` and it'll be inserted at the first slot instead of the end of the wiring chain.