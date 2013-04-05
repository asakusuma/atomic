# About the Examples

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