/*global Atomic:true */

Atomic.behaviors.composites.ACTORS = {
  namespace: 'AtomicCompositeActors',
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
            component = this.component,
            oldModify = this.component.modify;

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

          return oldModify.call(myself.component, done, roles);
        };
      }
    };
  })
};