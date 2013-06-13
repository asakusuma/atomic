/*global Atomic:true */
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
  modules: {},
  save: function(id, module) {
    if (Atomic.loader.modules[id]) {
      throw new Error('module already exists: ' + id);
    }
    Atomic.loader.modules[id] = module;
  },
  init: function() {
    if (window.jQuery) {
      Atomic.loader.save('jquery', window.jQuery);
    }
    Atomic.loader.save('atomic', window.Atomic);
  },
  load: function(deps) {
    var results = [];

    if (!deps) {
      return results;
    }

    for (var i = 0, len = deps.length; i < len; i++) {
      results[i] = Atomic.loader.modules[deps[i]];

      if (typeof results[i] === 'undefined') {
        throw new Error('Unable to load: ' + deps[i]);
      }
    }
    return results;
  }
});

// triggers an init, as the "none" loader needs to provide its own
// "require" function
Atomic.load(['atomic']);