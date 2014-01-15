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

(function(Atomic) {
  Atomic.augment(Atomic, {
    loader: {
      init: function() {},
      register: function(id, exports) {
        Atomic._.modules[id] = exports;
      },
      load: function(deps) {
        var resolved = [];
        for (var i = 0, len = deps.length; i < len; i++) {
          if (!Atomic._.modules[deps[i]]) {
            throw new Error('Module ID is not defined: ' + deps[i]);
          }
          resolved.push(Atomic._.modules[deps[i]]);
        }
        return resolved;
      }
    }
  });
}(Atomic));