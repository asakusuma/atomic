[![View Summary](https://travis-ci.org/Jakobo/atomic.png)](http://travis-ci.org/#!/Jakobo/atomic/branches)

# Atomic
## It's Just JavaScript

Atomic is a DOM Library Agnostic solution for creating a better HTML element. They're called **Atomic Components**, and they come with a robust event system and patterns for composition.

Why would you choose Atomic?
* **No DOM Library Opinion** You're not bound to jQuery, YUI, Ender, or anything of the sort
* **Small** 6kb gzipped
* **Simple** enhance an element, put them together, that's it
* **Works with AMD and CJS Loaders** You can use any loader strategy you'd like
* **Naturally Async** Components initialize and download dependencies only when you tell them too, giving you full control of the lifecycle

Why would you avoid Atomic?
* **Out-of-the-box** products like jQuery UI, Dijit, Flight, and more can give you large amounts of functionality for free. If you're not in an environment that may require you to one-off code or make frequent changes, you may want to consider one of these frameworks instead.
* **Prototyping** the amount of initial work you will need to build up in Atomic makes it a poor choice for prototyping. You should consider something like Bootstrap in those cases, which gives you a proof of concept for very little investment.

# Getting Started
## Your Script Tags

First, add a script loader to the page. Any loader that supports AMD or CommonJS will work. Offhand, we can think of a few:

* [Inject](http://www.injectjs.com) (AMD, CJS)
* [RequireJS](http://www.requirejs.org) (AMD)
* [Curl](https://github.com/cujojs/curl) (AMD, CJS)
* [Cajon](https://github.com/requirejs/cajon) (CJS)

You'll then want to "link" the loader to Atomic. This is done by augmenting `Atomic.Loader` with your needed method:

```js
// we'll call this "loader-config.js" for fun
Atomic.augment(Atomic.loader, {
  init: function() {
    // do any needed initialization
  },
  load: function(dependencies) {
    var deferred = Atomic.deferred();
    // call your loader's asynchronous download function
    // and then return a promise
    return deferred.promise;
  }
});
````

Atomic comes with a variety of loaders ready for you. [A list of loaders](./tree/master/src/compat/loaders) is available in the source tree, or in the `compat` directory of a distrobution.

## Enhancing elements with Components

Let's say you want to make a button. And a carousel. And have the button control the carousel. Just write JavaScript.

```js
Atomic.load('components/button', 'components.carousel')
.then(Atomic.expand(function(Button, Carousel) {
  var button = new Button(buttonElement);
  var carousel = new Carousel(carouselElement);
  button.on(button.events.USE, function() {
    carousel.next();
  });
  
  button.load()
  .then(carousel.load())
  then(null, Atomic.e);
}), Atomic.e)
.then(null, Atomic.e);
```

Click "next", advance "carousel". What just happened?

1. **Atomic.load()** will load the Button and Carousel from the `components/` directory. This is where all simple HTML Enhancements reside. Once the DOM is ready and the Elements objects loaded, the callback `function` is called with Button and Carousel in order.
2. Create the new objects with the **new** keyword, and pass them an element. This is the enhancement.
3. Use `on()`, `off()`, etc, all still with JavaScript

## What Can Components Do?

Atomic Components are designed to wrap normal HTML elements, making them behave more like modular bits of a larger system. A Component...

* Produces events independent of the DOM, enabling an abstraction of accessibility, touch events, and more
* Has a public API for manipulation

## Combining Components

The fun doesn't stop there! Atomic Components have a way to fuse together. Components can...

* Include other Atomic Components
* May expose their internals or provide an abstraction in front of its "inner workings"

# Um, examples?
You got it. The examples/ directory shows how you can use Atomic in many different ways

# What about unit tests?
"grunt test" or "grunt itest" if you like using your own browser.

# Built on Greatness
* [When](https://github.com/cujojs/when) and a great read about why [Promises are pretty sweet](https://gist.github.com/domenic/3889970)
* [Fiber](https://github.com/linkedin/Fiber) for OOP sugar internally
* [Eventemitter2](https://github.com/hij1nx/EventEmitter2) for a standalone event system

# By cool people
* Founding Team: Jakob Heuser, Eric Rowell, Jimmy Chan, Ryan Blunden, Asa Kusuma, Eugene O'Neill, Branden Thompson
* Contributors: [View the Contributor List](https://github.com/Jakobo/atomic/contributors)
