# Atomic
## It's Just JavaScript

Atomic is a DOM Library Agnostic solution for creating a better HTML element. They're called **Atomic Components**, and they come with a robust event system and patterns for composition.

Why would you choose Atomic?
* **No DOM Library Opinion** You're not bound to jQuery, YUI, Ender, or anything
* **Small** < 999kb **SIZE TBD**
* **Simple** enhance an element, put them together, that's it
* **Works with AMD and CJS Loaders** You can use any loader strategy you'd like

Why would you avoid Atomic?
* **Out-of-the-box** products like jQuery UI, Dijit, Flight, and more can give you large amounts of functionality for free.
* **Prototyping** the amount of initial work you will need to build up in Atomic makes it a poor choice for prototyping. You should consider something like Bootstrap in those cases

# Getting Started
## Your Script Tags

First, add a script loader to the page. Any loader that supports AMD or CommonJS will work. Offhand, we can think of a few:

* [Inject](http://www.injectjs.com) (AMD, CJS)
* [RequireJS](http://www.requirejs.org) (AMD)
* [Curl](https://github.com/cujojs/curl) (AMD, CJS)
* [Cajon](https://github.com/requirejs/cajon) (CJS)

Then, add the config to your page, and change the `system` variable to your loader framework of choice.
```js
// or inline it if that's your thing
<script src="config.js"></script>
```

Finally, load the atomic.js script
```js
<script src="atomic.js"></script>
```

Got all that? Good! Now we can enhance some elements.

## Enhancing elements with Components

Let's say you want to make a button. And a carousel. And have the button control the carousel. Just write JavaScript.

```js
Atomic.load(['components/button', 'components/carousel'], function(Button, Carousel) {
  var button = new Button(document.getElementById('next')),
      carousel = new Carousel(document.getElementById('carousel'));

  carousel.bind(button, button.events.USE, 'next');

  button.load();
  carousel.load();
});
```

Click "next", advance "carousel". What just happened?

1. **Atomic.load()** will load the Button and Carousel from the `components/` directory. This is where all simple HTML Enhancements reside. Once the DOM is ready and the Elements objects loaded, the callback `function` is called with Button and Carousel in order.
2. Create the new objects with the **new** keyword, and pass them an element. This is the enhancement.
3. Use `bind()`, `on()`, `off()`, and more, all still with JavaScript

## What Can Components Do?

Atomic Components are designed to wrap normal HTML elements, making them behave more like modular bits of a larger system. A Component...

* Produces events independent of the DOM, enabling an abstraction of accessibility, touch events, and more
* Has a public API for manipulation

## Combining Components Into Composites

The fun doesn't stop there! Atomic Components have a way to fuse together. The end result, we call Composites. Composites are just like Components, except they also...

* Include other Atomic Components
* May expose their internals or provide an abstraction in front of its "inner workings"

# Um, examples?
You got it. The examples/ directory shows how you can use Atomic in many different ways:

* files starting with pojs_* are the `plain old JavaScript` apis. Backbone, jQuery, it doesn't matter. Make Components and use them.
* files starting with magic_* are the `magic HTML interface` apis. Make some Components straight from your markup? Sure, if that's your thing!

# Built on Greatness
* [Q.js](https://github.com/kriskowal/q) and a great read about why [Promises are pretty sweet](https://gist.github.com/domenic/3889970)
* [Fiber](https://github.com/linkedin/Fiber) for OOP sugar internally
* [Eventemitter2](https://github.com/hij1nx/EventEmitter2) for a standalone event system

# By cool people
* Founding Team: Jakob Heuser, Eric Rowell, Jimmy Chan, Ryan Blunden, Asa Kusuma, Eugene O'Neill, Branden Thompson
* Contributors: [View the Contributor List](https://github.com/Jakobo/atomic/contributors)