/*global Atomic:true, AbstractElement:true */

/**
 * AbstractElement a template for creating components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and can be combined with additional
 * components to create Compsites.
 * @class AbstractElement
 */
var AbstractMolecule = Atomic.OOP.extend(AbstractElement, function (base) {
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
     * @property {Object} AbstractMolecule#has
     */
    has: {},

    /**
     * A set of actors to use using the molecule.COMBINE
     * augmentation.
     * @property {Array} AbstractMolecule#actors
     */
    actors: [],

    /**
     * A key/object collection of built in molecule operations
     * These identify various behaviors that all molecules get for free
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
     * @property {Object} AbstractMolecule#molecule
     */
    molecule: {
      COMBINE: Atomic.behaviors.molecule.COMBINE
    },

    /**
     * Load the Element, resolve all dependencies
     * calls the ready method
     * @method AbstractMolecule#load
     * @param {Object} cb - a callback to run when this is loaded
     */
    load: function (cb) {
      var self = this;
      // Atomic.load HAS element, remap into a resolved object
      var resolved = {};
      self.modify(cb, resolved);
    },

    /**
     * Triggers when an element is loaded.
     * @method AbstractMolecule#modify
     * @param {Object} done - invoke this callback when the modifying is complete
     * @param {Object} resolved - a collection of resolved dependencies
     * @param {Object} actors - If you are a Molecule, then you will get your roles
     */
    modify: function (done, resolved, actors) {}
  };
});


if (module && module.exports) {
  module.exports = AbstractMolecule;
}
