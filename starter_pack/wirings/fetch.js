/*global Atomic:true, require:true, module:true, define: true, console:true */

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
function factory() {
  return function(config) {
    config = config || {};

    var endpoint = config.endpoint;

    return {
      init: function() {
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
        var $ = require('jquery'),
            self = this,
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
            self.nodes()._root.innerHTML = response;
          }
          else {
            self.nodes()._root.innerHTML += response;
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
factory.id = 'wirings/fetch';

Atomic.export(module, define, factory);
