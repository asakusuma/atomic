# About the Examples

## modules/*
In here, you can find a collection of modules that show how to build on top of Atomic.AbstractBehavior and Atomic.AbstractElement. This would likely mirror the structure of your own code. These are very minimalist examples.

* modules/elements/carousel.js - a sample Element, the "Carousel"
* modules/elements/carousel/behaviors/selectable - a sample Behavior that modifies "Carousel"
* modules/elements/button.js - a sample Element, the "Button"

* molecules/carouselwithbuttons.js - a sample Molecule, combining a "Carousel" and a "Button" into a single reusable object that depends on DOM structure.

We plan to eventually launch a bootstrapping collection of Elements. It has no name yet, but it is designed to be like the [Jeesh of Ender](https://github.com/ender-js/jeesh)

## The pojs_* files
The Plain Old JavaScript (POJS) interfaces show how you would use regular ole JavaScript with Atomic Elements to accomplish your UI goals. While these examples are written for jQuery, they could easily work with Backbone, with Zepto, or really any JavaScript library (or no JS library!). You're only limited by the Elements and Behaviors you choose to include.