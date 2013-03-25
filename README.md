# Atomic
## It's Just JavaScript

Atomic is a way to create a better HTML Element. Atomic Elements are like their HTML counterparts, but come with a robust event system and patterns for composing multiple Elements together for a greater cause.

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

## Enhancing Elements

Let's say you want to make a button. And a carousel. And have the button control the carousel. Just write JavaScript.

```js
Atomic.load(['Button', 'Carousel'], function(Button, Carousel) {
  var button = new Button(document.getElementById('next')),
      carousel = new Carousel(document.getElementById('carousel'));

  carousel.bind(button, button.events.USE, 'next');
});
```

Click "next", advance "carousel". What just happened?

1. **Atomic.load()** will load the Button and Carousel from the `elements` directory. This is where all simple HTML Enhancements reside. Once the DOM is ready and the Elements objects loaded, the callback `function` is called with Button and Carousel in order.
2. Create the new objects with the **new** keyword, and pass them an element. This is the enhancement.
3. Use `bind()`, `on()`, `off()`, and more, all still with JavaScript

## What Can Elements Do?

Atomic Elements are designed to wrap normal HTML elements, making them behave more like modular bits of a larger system.