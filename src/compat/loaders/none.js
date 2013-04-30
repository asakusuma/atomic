/*global Atomic:true */

Atomic.augment(Atomic.loader, {
  modules: {},
  save: function(id, module) {
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
    for (var i = 0, len = deps.length; i < len; i++) {
      results[deps[i]] = Atomic.loader.modules[deps[i]];
    }
    return results;
  }
});
Atomic.load(['atomic']); // sanity check and triggers init