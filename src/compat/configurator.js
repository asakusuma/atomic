
var CONFIG = Atomic.Config;

// ensure configuration is valid
if (!CONFIG[CONFIG.system]) {
  throw new Error('unable to locate a dependency configuration: ' + CONFIG.system);
}

// INJECT
// http://www.injectjs.com
if (CONFIG.system === 'inject') {
  if (!context.Inject) {
    throw new Error('Inject is not available in the global window scope');
  }
  context.Inject.setModuleRoot(CONFIG.inject.modules);
  context.Inject.addRule(/^atomic$/, {
    last: true,
    path: CONFIG.inject.atomicjs
  });
  if (CONFIG.inject.resolver && typeof CONFIG.inject.resolver === 'function') {
    context.Inject.addRule(/.*/, {
      path: function(path) {
        return CONFIG.inject.resolver(path);
      }
    });
  }
}

// REQUIREJS
// http://www.requirejs.org
if (CONFIG.system === 'requirejs') {
  // TODO
}