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
(function(define) {
  define('wirings/debugtracer', ['Atomic/Wiring'], function(Wiring) {
    return Wiring(function(config) {
      return {
        init: function() {
          var ignore = {
            wrap: 1,
            needs: 1,
            nodes: 1,
            events: 1,
            elements: 1
          };
          var self = this;
          var tracerId = 0;
          var callId = 0;
          var callDebugged = function(name) {
            tracerId++;
            self.wrap(name, function(original) {
              var args = [].slice.call(arguments);
              args.shift();
              console.log(tracerId + '-' + (++callId) + ': calling ' + name + ' with ', args);
              var ret = original.apply(self, args);
              console.log(tracerId + '-' + (callId--) + ': completed ' + name);
              return ret;
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
    });
  });
}(typeof define == 'function' && define.amd ? define : Atomic));