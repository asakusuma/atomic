/*global Atomic:true, Inject:true, define:true */
/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

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
