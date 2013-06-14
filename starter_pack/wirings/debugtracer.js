/*global require:true, module:true, define: true, console:true */
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

/*
This wiring adds debugging ability to all methods within a component
*/
var Atomic = (typeof require !== 'undefined') ? require('atomic') : window.Atomic;

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
try { Atomic.export(module, define, definition); } catch(e) { Atomic.export(definition); }