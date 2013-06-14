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
A reusable wiring.
This is a sample wiring. Go ahead and include it and add "echo" methods
*/
var Atomic = (typeof require !== 'undefined') ? require('atomic') : window.Atomic;

function definition() {
  return function(config) {
    return {
      init: function() {
        this.echo('Initialized Echo wiring');
      },
      /**
       * This is a custom method. Anyone who wires in this object
       * will get an "echo" method.
       */
      echo: function(msg) {
        console.log(msg);
      },

      warn: function(msg) {
        console.warn(msg);
      }
    };
  };
}
// you only need to set .id if you are using the "system" loader
definition.id = 'wirings/echo';

try { Atomic.export(module, define, definition); } catch(e) { Atomic.export(definition); }