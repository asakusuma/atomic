/*global Atomic:true, module:true, define: true, console:true */
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
* fetch wiring.  Makes it really easy to fetch chunks of HTML and inject
* the response into a document
* @param {Object} config
* @param {Object} oCallback object literal that contains success and failure functions
*/
// TODO: Now that I've implemented this, I'm unsure if it's needed as a wiring.
// it feels more like a utility method.  It doesn't even have an initializer.  Perhaps
// the value of wirings becomes more evident when they:
// 1) have initializers
// 2) add multiple methods
// 3) require static nodes
// Eric
function definition() {
  return function(config) {
    config = config || {};

    var endpoint = config.endpoint;
    var $;

    return {
      depends: ['jquery'],

      init: function() {
        $ = this.depends('jquery');
        console.log('Initialized Fetch wiring');
      },
      /**
       * Adds a fetch method to a component
       * the fetch method can retrieve parameterized content
       * and optionally replace or append to an existing node
       * @method Wiring#fetch
       * @for AbstractComponent
       * @param {Object} params - url parameters for the request
       * @param {Boolean} replace - if true, the node's content will be replaced
       * @param {Object} callbacks - YUI style callbacks object. Appended to the promise
       * @returns Atomic.deferred
       */
      fetch: function(params, replace, callbacks) {
        var self = this,
            deferred = Atomic.deferred(),
            url = endpoint + '?',
            key;

        if (callbacks) {
          if (callbacks.success) {
            deferred.promise.then(callbacks.success);
          }
          if (callbacks.error) {
            deferred.promise.then(null, callbacks.error);
          }
        }

        // build url
        if (params) {
          for (key in params) {
            url += key + '=' + params[key] + '&';
          }
        }
        url += 'r=' + (Math.random() * 999999999);

        // async request
        $.ajax({
          url: url
        }).success(function(response) {
          if (replace) {
            self.elements()._root.innerHTML = response;
          }
          else {
            self.elements()._root.innerHTML += response;
          }
          deferred.resolve();
        }).error(function(err) {
          deferred.reject(err);
        });

        return deferred.promise;
      }
    };
  };
}

// you only need to set .id if you are using the "system" loader
definition.id = 'wirings/fetch';

try { Atomic.export(module, define, definition); } catch(e) { Atomic.export(definition); }
