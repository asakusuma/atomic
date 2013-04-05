/*global Atomic:true, context:true */

// ensure configuration is valid
if (!Atomic.Config[Atomic.Config.system]) {
  throw new Error('unable to locate a dependency configuration: ' + Atomic.Config.system);
}

// INJECT
// http://www.injectjs.com
if (Atomic.Config.system === 'inject') {
  if (!context.Inject) {
    throw new Error('Inject is not available in the global window scope');
  }

  Atomic.initLoader = function () {
    context.Inject.setModuleRoot(Atomic.Config.inject.modules);
    context.Inject.addRule(/^atomic$/, {
      last: true,
      path: Atomic.Config.inject.atomicjs
    });
    if (Atomic.Config.inject.resolver && typeof Atomic.Config.inject.resolver === 'function') {
      context.Inject.addRule(/.*/, {
        path: function(path) {
          return Atomic.Config.inject.resolver(path);
        }
      });
    }
  };
}

// REQUIREJS
// http://www.requirejs.org
if (Atomic.Config.system === 'requirejs') {
  // TODO
}

// SINGLEFILE
// http://www.requirejs.org
if (Atomic.Config.system === 'globals') {
  context.AtomicRegistry = {};
}