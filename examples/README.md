# About the Examples

**Note** Long term, we should split these up into multiple tutorial items.

## atomic/*
In here, you can find a collection of Components and Composites that show how to build on top of Atomic.AbstractBehavior and Atomic.AbstractComponent. This would likely mirror the structure of your own code. These are very minimalist examples.

* atomic/components/carousel.js - a sample Components, the "Carousel"
* atomic/components/carousel/behaviors/selectable - a sample Behavior that modifies "Carousel"
* atomic/components/button.js - a sample Component, the "Button"

* composites/carouselwithbuttons.js - a sample Composite, combining a "Carousel" and a "Button" into a single reusable object that depends on DOM structure.

We plan to eventually launch a bootstrapping collection of Components and Composites. It has no name yet, but it is designed to be like the [Jeesh of Ender](https://github.com/ender-js/jeesh)

## The pojs_* files
The Plain Old JavaScript (POJS) interfaces show how you would use regular ole JavaScript with Atomic Components to accomplish your UI goals. While these examples are written for jQuery, they could easily work with Backbone, with Zepto, or really any JavaScript library (or no JS library!). You're only limited by the Components, Composites, and Behaviors you choose to include.

## composite_* files
The Composition API (Comps) shows how as an end developer, you would use a Composite. Since a Composite requires multiple "actors", you add them using the built in .composite.ACTORS behavior. These actors fulfill their roles in the Composite, and the composite will do whatever it needs to with those elements in order to build our your final object.

## magic_* files
The Atomic Magic Interface (AMI) is a plugin that when used allows you to scan your HTML for Atomic Components and Composites, creating them on demand. If you just want to write markup and have magic happen, perhaps this is for you. For users of JS frameworks, this is probably less desirable, and you may wish to fall back to the Comps or POJS interfaces.

# Layers
To keep everything cohesive, think of the Atomic ecosystem like this:

* The AMI (Atomic Magic Interface) is just a HTML scanner that makes use of
* The Composition (Comps) interface to put together Components
* All of which are created using an obvious Plain Old JavaScript (POJS) API

# How do I build a Component?
The following template can be used as a guide for creating a Component:

```js
function factory() {

  var Atomic = require('atomic'),
      $ = require('jquery'),
      SampleTemplate;

  SampleTemplate = Atomic.OOP.extend(Atomic.AbstractComponent, function (base) {
    return {
      events: {},
      modify: function (done) {
        done();
      }
    };
  });

  return SampleTemplate;
}

if (module && module.exports) {
  module.exports = factory();
}
else if (define && define.amd) {
  define(factory);
}
else if (this.AtomicRegistry) {
  this.AtomicRegistry['components/sampletemplate'] = factory;
}
```

So what's going on here?

1. The `factory` function allows you to create a local scope for all your require() statements. In non-commonJS environments, this can also help you avoid putting things into the window scope. This module depends on `jquery` and the `Atomic` library.
2. `Atomic.OOP.extend(Atomic.AbstractComponent, function (base) {})` is a direct pass through to [Fiber.js](https://github.com/linkedin/fiber). Fiber isn't exposed directly for readability.
3. The return object inside of `Atomic.OOP.extend` is your public interface for the Component. By inheriting from `AbstractComponent`, instantiation via `init()` is handled for you automatically. The two elements you likely want to implement are `events{}` and `modify()`.
  * *events{}* is a key/value pair that identifies the events this Component could generate. It's recommended that consuming developers reference the `events{}` collection as opposed to hard coding strings. This way, the external consuming developer is never left waiting for events that never fire
  * *modify()* is the execution step. Atomic only calls *modify()* when the consuming developer invokes `yourComponent.load()`. Since this is promoted to developers as an asynchronous operation, you should call `done()` once you are done setting up the Component. Some examples of things you may want to do in `modify()` include setting up DOM event listeners, broadcasting events from the `this.events{}` collection, changing markup, or making AJAX calls.
4. Return the object created from `Atomic.OOP`, completing the factory method
5. Based on the environment, you can have your new Component stored in a variety of ways. `module` and `module.exports` are for CommonJS environments, `define` is for AMD scenarios, and `AtomicRegistry` is available to people who are just loading their files ahead of time in script tags.

# How do I build a Composite?
The following template can be used to build a Composite. It will look very similar to a Component, but with a few extra properties

```js
function factory() {
  var Atomic = require('atomic'),
      $ = require('jquery'),
      SampleTemplate;

  SampleTemplate = Atomic.OOP.extend(Atomic.AbstractComposite, function (base) {
    return {
      has: {},
      actors: [],
      events: {},
      modify: function (done, resolved, actors) {
        done();
      }
    };
  });

  return SampleTemplate;
}

if (module && module.exports) {
  module.exports = factory();
}
else if (define && define.amd) {
  define(factory);
}
else if (this.AtomicRegistry) {
  this.AtomicRegistry['composites/sampletemplate'] = factory;
}
```

Let's break this one down too

1. `events{}` is the same as in the Component
2. `has{}` is a set of downloadable Components or Composites you want to have made available to your Composite during the `modify()` method. Define them like `has: { MyComponent: 'components/mycomponent' }`, and you'll see the results inside of `modify()`
3. `actors[]` is a set of nodes inside of your primary element that may be needed for this Composite to work properly. For example, a "Carousel with Buttons" probably needs to know which nodes are carousels, which nodes are "next" buttons, and which buttons are "previous" buttons. A Composite author can make this known to a consuming developer by declaring `actors: ['Carousel', 'NextButtons', 'PreviousButtons']` which translates to "Give me something you want made into a Carousel, NextButtons, and PreviousButtons"
4. `modify()` is the same is with a Component, but is given two new arguments. Call `done()` just like before when all setup is complete.
  * All the items from `has{}` are downloaded and placed into the second parameter for modify, `resolved`
  * All the actors a consuming developer set up for you are available in the third parameter for modify, `actors`

# Building a Behavior
B