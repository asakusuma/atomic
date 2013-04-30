/*global Atomic:true, Inject:true, define:true */

Atomic.augment(Atomic.loader, {

  moduleRoot:   'YOUR_BASE_URL_HERE', // Set this to your base URL for modules

  // ====== Do not edit below this line ======
  // ==========================================================================
  init: function() {
    if (!require) {
      throw new Error('RequireJS must be defined on the page before loading');
    }

    require.config({
      baseUrl: Atomic.loader.moduleRoot
    });

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
