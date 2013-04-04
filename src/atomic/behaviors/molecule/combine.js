/*global Atomic:true */

Atomic.behaviors.molecule.COMBINE = {
  namespace: 'AtomicMoleculeComposition',
  path: null,
  object: Atomic.OOP.extend(Atomic.AbstractBehavior, function (base) {
    return {
      contract: {},
      events: {},
      methods: {},

      /**
       * handle modification
       * @see AbstractBehavior#modify
       */
      modify: function (done) {
        var myself = this,
            element = this.element,
            oldModify = this.element.modify;

        this.element.modify = function(done) {
          // create the roles config object with every item
          // then call the original method with the extra param
          // TODO: Check against this.element.roles[]
          var roles = {};
          for (var name in this.configuration) {
            if (!this.configuration.hasOwnProperty(name)) {
              continue;
            }
            roles[name] = this.configuration[name];
          }

          return oldModify.call(element, done, roles);
        };
      }
    };
  })
};