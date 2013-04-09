/*global Atomic:true, AbstractComponent:true */

/**
 * AbstractComposite a template for creating components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and can be combined with additional
 * components to create Compsites.
 * @class AbstractComposite
 */
var AbstractComposite = Atomic.OOP.extend(AbstractComponent, function (base) {
  return {
    /**
     * A key/string collection of dependencies in this component
     * If a given component depends on additional components in the
     * ecosystem, they can be noted here. Listing components here
     * instead of in require() statements at the top has several
     * advantages
     *
     * - has{} dependencies are late-loaded resolved at element-attach
     * - has{} dependencies are localized to your attach() method
     * - has{} dependencies are easily expected using console.log
     *
     * Make the lives of people depending on you better. Use has{}
     *
     * @property {Object} AbstractComposite#has
     */
    has: {},

    /**
     * A set of actors to use using the composite.ACTORS
     * augmentation.
     * @property {Array} AbstractComposite#actors
     */
    actors: [],

    /**
     * A key/object collection of built in Composite operations
     * These identify various behaviors that all Composites get for free
     *
     * A behavior's object contains three properties, "namespace",
     * "path", and "object".
     *
     * namespace: a local name for the string to assist in namespacing
     * path: a path from the current component to the behavior
     * object: the behavior object (can be used in place of "path")
     *
     * SELECTED: {namespace: 'selected', path: 'module/path'}
     *
     * @property {Object} AbstractComposite#composite
     */
    composite: {
      ACTORS: Atomic.behaviors.composites.ACTORS
    },

    /**
     * Load the Composite, resolve all dependencies
     * calls the ready method
     * @method AbstractComposite#load
     * @param {Object} cb - a callback to run when this is loaded
     */
    load: function (cb) {
      var self = this;
      // Atomic.load HAS element, remap into a resolved object
      var resolved = {};
      self.modify(cb, resolved);
    },

    /**
     * Triggers when a Component is loaded.
     * @method AbstractComposite#modify
     * @param {Object} done - invoke this callback when the modifying is complete
     * @param {Object} resolved - a collection of resolved dependencies from has{}
     * @param {Object} actors - A collection of objects fufilling the ACTORS behavior
     */
    modify: function (done, resolved, actors) {}
  };
});


if (module && module.exports) {
  module.exports = AbstractComposite;
}
