// atomic.js
(function(context, undefined) {
  var Atomic = {};
  Atomic.Config = context.ATOMIC_CONFIG || {};

  /**
   * load the specified dependencies, then run the callback
   * with the dependencies as arguments. This abstracts
   * away any loader framework implementations
   * @method load
   * @param Array depend - an array of dependencies
   * @param Function then - a callback to run with dependencies as arguments
   */
  Atomic.load = function(depend, then) {};

  // include compat/configurator.js
  /* BEGIN compat/configurator.js */
  /* END compat/configurator.js */

  // include lib/fiber.js
  /* BEGIN lib/fiber.js */
  /* END lib/fiber.js */

  // include atomic/abstractcomponent.js
  /* BEGIN atomic/abstractcomponent.js */
  /* END atomic/abstractcomponent.js */

  // include atomic/abstractbehavior.js
  /* BEGIN atomic/abstractbehavior.js */
  /* END atomic/abstractbehavior.js */

  Atomic.Libs.Fiber = context.Fiber.noConflict();
  Atomic.AbstractComponent = AbstractComponent;
  Atomic.AbstractBehavior = AbstractBehavior;

  context.Atomic = Atomic;
})(this);
