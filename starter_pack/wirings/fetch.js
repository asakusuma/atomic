/*global require:true, module:true, define: true, console:true */

/**
* fetch wiring.  Makes it really easy to fetch chunks of HTML and inject
* the response into a document
* @param {Object} config
* @param {Object} oCallback object literal that contains success and failure functions
*/
function factory() {
  return function(config) {
    config = config || {};

    var endpoint = config.endpoint;

    return {
      init: function(needs, nodes) {
        console.log('Initialized Fetch wiring');
      },
      fetch: function(oParams, oCallback, replace){
        var that = this,
            url = endpoint + '?',
            deferred = Atomic.deferred(),
            key;

        // build url
        if (oParams) {
          for (key in oParams) {
            url += key + '=' + oParams[key] + '&';
          }
        }
        url += 'r=' + ((Math.random() * 999999999) | 0);

        // async request
        $.ajax({
          url: url
        }).done(function(response) {
          if (replace) {
              that.nodes._root.innerHTML = response;
          }
          else {
              that.nodes._root.innerHTML += response;
          }
          oCallback.success();
        });
      }
    };
  };
}
// you only need to set .id if you are using the "system" loader
factory.id = 'wirings/fetch';

Atomic.export(module, define, factory);