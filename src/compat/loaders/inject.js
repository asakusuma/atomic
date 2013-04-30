/*global Atomic:true, context:true */

// INJECT
// http://www.injectjs.com
if (Atomic.Config.system === 'inject') {
  if (!context.Inject) {
    throw new Error('Inject is not available in the global window scope');
  }

  Atomic.augment(Atomic.loader, {
    init: function() {
      context.Inject.setModuleRoot(Atomic.Config.inject.modules);
      if (Atomic.Config.inject.resolver && typeof Atomic.Config.inject.resolver === 'function') {
        context.Inject.addRule(/.*/, {
          path: function(path) {
            return Atomic.Config.inject.resolver(path);
          }
        });
      }
    },
    load: function(deps) {
      var results = [];
      var deferred = Atomic.deferred();
      context.require(deps, function(require) {
        try {
          for (var i = 0, len = deps.length; i < len; i++) {
            results[results.length] = require(deps[i]);
          }
        }
        catch(e) {
          return deferred.reject(e);
        }

        return deferred.resolve(results);
      });

      return deferred.promise;
    }
  });
}