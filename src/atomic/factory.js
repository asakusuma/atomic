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

var __Atomic_Private_Factory_Methods__ = {
  Factory: function(objLiteral) {
    var wiring = objLiteral.wiring || [];

    // certain items are "reserved" and cannot be overridden in a wiring
    var reserved = {
      // these are "special" but are okay to set using wiring
      // we are calling them out for readability's sake
      // wiring has a special use case below
      'needs':          false,
      'nodes':          false,
      'events':         false,
      'wiring':         true,
      '_inits':         true,
      '_eventEmitter':  true,
      '_isDestroyed':   true
    };

    // currently, we aren't doing anything fancy here
    // fiber requires an object literal that defines the interface
    // and we create the interface from the object literal
    // provided. For every item, if it's not in our reserved list,
    // we place it onto the additionalMethods collection.
    //
    // We then create an init() method that puts the wiring value
    // as first on the stack of wiring items.
    //
    // When a component is created, the wirings are pulled in
    // and ran in order.
    var component = Atomic._.AbstractComponent.extend(function(base) {
      var additionalMethods = {};
      // add all other extras
      for (var name in objLiteral) {
        if (!objLiteral.hasOwnProperty(name) || reserved[name]) {
          continue;
        }
        additionalMethods[name] = objLiteral[name];
      }
      additionalMethods.init = function() {
        base.init.apply(this, arguments);

        if (typeof wiring === 'function') {
          this.wireIn(wiring);
        }
        else if (Object.prototype.toString.call(wiring) === '[object Array]') {
          for (var i = 0, len = wiring.length; i < len; i++) {
            this.wireIn(wiring[i]);
          }
        }
      };

      return additionalMethods;
    });

    return component;
  }
};

var __Atomic_Public_Factory_Methods__ = {
  Component: function(objLiteral) {
    return __Atomic_Private_Factory_Methods__.Factory(objLiteral);
  }
};

__Atomic_Public_Factory_Methods__ = __Atomic_Public_Factory_Methods__;
__Atomic_Private_Factory_Methods__ = __Atomic_Private_Factory_Methods__;