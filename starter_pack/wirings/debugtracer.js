/*global require:true, module:true, define: true, console:true */

/*
This wiring adds debugging ability to all methods within a component
*/
var Atomic = require('atomic');

function definition() {
  return function(config) {
    return {
      init: function() {
        var ignore = {
          before: 1,
          after: 1,
          needs: 1,
          nodes: 1,
          events: 1
        };
        var self = this;
        var tracerId = 0;
        var callId = 0;
        var callDebugged = function(name) {
          tracerId++;
          self.before(name, function() {
            console.log(tracerId + '-' + (++callId) + ': calling ' + name + ' with ', arguments);
          });
          self.after(name, function() {
            console.log(tracerId + '-' + (callId--) + ': completed ' + name);
          });
        };

        for (var name in this) {
          if (ignore[name] || typeof this[name] !== 'function') {
            continue;
          }
          callDebugged(name);
        }
      }
    };
  };
}
definition.id = 'wirings/debugtracer';
Atomic.export(module, define, definition);