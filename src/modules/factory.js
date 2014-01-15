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
  Atomic.augment(Atomic._, {
    /**
     * The Internal Factory function hides most of the logic
     * for creating Atomic Components. It's split out to keep the
     * interface separate from the Fiber integration
     * @method Atomic.Factory
     * @private
     * @see Atomic.Component
     */
    Factory: function(objLiteral) {
      // certain items are "reserved" and cannot be overridden in a wiring
      var reserved = {
        // these are "special" but are okay to set using wiring
        // we are calling them out for readability's sake
        // wiring has a special use case below
        'depends':        false,
        'elements':       false,
        'events':         false,
        'init':           true,
        '_init':          true,
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
          if (typeof objLiteral.init === 'function') {
            this._init = objLiteral.init;
          }
        };

        return additionalMethods;
      });

      return component;
    }
  });
  
  Atomic.augment(Atomic, {
    /**
     * Creates an Atomic Component
     * An Atomic Component consists of the following items in its object literal:
     * depends - an array of dependencies required for this component
     * elements - an object literal of node name / purpose
     * events - an object literal of event name / purpose
     * wiring - a function or object literal compatible with AbstractComponent#wireIn
     * @method Atomic.Component
     * @param {Object} objLiteral - the object literal to create a component from
     * @return {Object} an object that extends AbstractComponent
     */
    Component: function(objLiteral) {
      return __Atomic_Private_Factory_Methods__.Factory(objLiteral);
    },
  
    Wiring: function(wiring) {
      wiring.__atomic = true;
      return wiring;
    }
  });
}(Atomic));
