/*global require:true, module:true, define: true, console:true */

/**
* fetch wiring.  Makes it really easy to fetch chunks of HTML and inject
* the response into a document
*/
function factory() {
  return function(config) {
    config = config || {};
    var endpoint = config.endpoint;

    return {
      init: function(needs, nodes) {
        console.log('Initialized Fetch wiring');
      },
      fetch: function(params){
        var that = this,
            url = endpoint,
            key;

        if (params) {
          url += '?';
          for (key in params) {
            url += key + '=' + params[key] + '&';
          }
        }

        console.log('requesting ' + url + '...');

        $.ajax({
          url: url
        }).done(function(response) {
          console.log('successful response');
          // add response to Items
          that.nodes._root.innerHTML += response;
        });
      }
    };
  };
}
// you only need to set .id if you are using the "system" loader
factory.id = 'wirings/fetch';

Atomic.export(module, define, factory);