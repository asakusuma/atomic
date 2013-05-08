/*global Atomic:true */

Atomic.augment(Atomic.loader, {
  modules: {},
  save: function(id, module) {
    if (Atomic.loader.modules[id]) {
      throw new Error('module already exists: ' + id);
    }
    Atomic.loader.modules[id] = module;
  },
  init: function() {
    window.require = function(name) {
      return Atomic.loader.modules[name];
    };
    window.module = null;
    window.define = null;

    if (window.jQuery) {
      Atomic.loader.save('jquery', window.jQuery);
    }
    Atomic.loader.save('atomic', window.Atomic);
  },
  load: function(deps) {
    var results = {};

    if (!deps) {
      return results;
    }

    for (var i = 0, len = deps.length; i < len; i++) {
      results[deps[i]] = Atomic.loader.modules[deps[i]];

      if (typeof results[deps[i]] === 'undefined') {
        throw new Error('Unable to load: ' + deps[i]);
      }
    }
    return results;
  }
});

// triggers an init, as the "none" loader needs to provide its own
// "require" function
Atomic.load(['atomic']);