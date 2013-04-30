/*global Atomic:true, Inject:true, define:true */

Atomic.augment(Atomic.loader, {

  moduleRoot:   'YOUR_BASE_URL_HERE', // Set this to your base URL for modules
  devMode:      true,                 // if true, no caching will be enabled

  // ====== Do not edit below this line ======
  // ==========================================================================
  init: function() {
    if (!Inject) {
      throw new Error('Inject must be defined on the page');
    }

    Inject.setModuleRoot(Atomic.loader.moduleRoot);

    if (Atomic.loader.devMode) {
      Inject.setExpires(0);
    }

    define('atomic', [], window.Atomic);
  },
  load: function(deps) {
    var results = {};
    var deferred = Atomic.deferred();

    deps.unshift('require');
    require(deps, function(require) {
      try {
        for (var i = 0, len = deps.length; i < len; i++) {
          results[deps[i]] = require(deps[i]);
        }

        deferred.resolve(results);
      }
      catch(e) {
        deferred.reject(e);
      }
    });

    return deferred.promise;
  }
});
Atomic.load(['atomic']); // sanity check and triggers init
