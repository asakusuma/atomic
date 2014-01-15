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

/**
 * A helper method to return the promises library object. Aids in unit
 * testing the public functions
 * @method Atomic.getPromiseLibrary
 * @private
 * @returns {Object} the promise library
 */
function getPromiseLibrary() {
  return Atomic._.Bluebird;
}

/**
 * Tests if an element has a class
 * @method AbstractComponent.hasClass
 * @private
 * @param {HTMLElement} el - an html element
 * @param {String} klass - a class name to test for
 * @returns {Boolean}
 */
function hasClass(el, klass) {
  return el.className.match(new RegExp('(?:^|\\s)' + klass.replace(/[^A-Z0-9\-\_]/gi, '-') + '(?!\\S)'));
}

/**
 * Test if the provided object is an array
 * @method AbstractComponent.isArray
 * @private
 * @param {Object} obj - the object to test
 * @returns {Boolean} if true, the object is an array
 */
function isArray(obj) {
  return Object.prototype.toString.call(obj) === '[object Array]';
}

/**
 * Creates a "displayable" version of an object or array.
 * On instantiation of an AbstractComponent, this is what
 * converts the elements/depends/events into their final
 * resolved forms.
 * An object returned by createDisplayable has the following
 * methods available to it:
 *
 * () - called as a function with no arguments, the resolved
 *   version of the object is provided. This is all of the
 *   assignments that have been made.
 * (key) - called as a function with one argument, the resolved
 *   value for a specific key is provided. This is the same as
 *   calling ().key
 * (key, value) - assigns a resolved "value" to a key
 * .toString() - the string interface for this object provides
 *   the original structure in an easy to read format. It also
 *   indicates which objects have been resolved and have values
 *   assigned to them. This is primarily a debugging tool.
 * ._ - a collection of internal methods for the interface,
 *   including add (adds new items to the collection), raw
     (returns the original object), and set (assigns a resolved
 *   value)
 *
 * @function createDisplayableObject
 * @private
 * @param {Object} obj - the object to convert
 * @param {Boolean} writeBack - if true, properties are also stored on the returned object
 * @param {Boolean} preResolved - if true, no resolution of the object is used. The keys become values
 * @returns {Object} a function/object combination wtih the above methods
 */
function createDisplayableObject(obj, writeBack, preResolved) {
  var type = (isArray(obj)) ? 'array' : 'object';
  var values = {};
  var registry = {};
  var name, i, len;
  var iface = function(key, to) {
    if (key && to) {
      return iface._.set(key, to);
    }
    else if (key) {
      return values[key];
    }
    return values;
  };
  iface.toString = function() {
    var out = [];
    var name, i;
    if (type === 'object') {
      for (name in obj) {
        if (obj.hasOwnProperty(name)) {
          out.push(name + ' (' + (values[name] ? 'R' : '?') + '): ' + obj[name]);
        }
      }
    }
    else {
      for (i = 0, len = obj.length; i < len; i++) {
        out.push('[' + i + '] (' + (values[obj[i]] ? 'R' : '?') + '): ' + obj[i]);
      }
    }
    return out.join('\n');
  };
  iface._ = {
    raw: function() {
      return obj;
    },
    exists: function(key) {
      if (type === 'array') {
        for (var i = 0, len = obj.length; i < len; i++) {
          if (obj[i] === key) {
            return true;
          }
        }
        return false;
      }
      else {
        for (var name in obj) {
          if (obj.hasOwnProperty(name) && name === key) {
            return true;
          }
        }
        return false;
      }
    },
    add: function() {
      if (type === 'array') {
        if (!registry[arguments[0]]) {
          registry[arguments[0]] = 1;
          obj.push(arguments[0]);
          iface._.set(arguments[0], null);
        }
      }
      else {
        obj[arguments[0]] = arguments[1];
        if (writeBack) {
          iface[arguments[0]] = arguments[0];
        }
        if (preResolved) {
          values[arguments[0]] = arguments[0];
        }
      }
    },
    set: function(key, to) {
      values[key] = to;
    }
  };

  if (type === 'object') {
    for (name in obj) {
      if (obj.hasOwnProperty(name)) {
        iface._.set(name, null);
        if (writeBack) {
          iface[name] = name;
        }
        if (preResolved) {
          values[name] = name;
        }
      }
    }
  }
  else {
    for (i = 0, len = obj.length; i < len; i++) {
      iface._.set(obj[i], null);
    }
  }

  return iface;
}