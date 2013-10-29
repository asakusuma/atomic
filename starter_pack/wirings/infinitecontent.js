/*global require:true, module:true, define: true */
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
This starter pack wiring adds the ability to fetch additional content
and add it to the container. In order to use this wiring, it must be
configured with the following:
  * url: function - this is a function to generate the "more" url.
    its signature includes the number of times this component has
    requested more content
    function(timesCalled) { return urlToCall; }
  * format: function - optional. If provided, this function will
    transform the response into insertable content. This is useful
    when you are retrieving JSON, and want to convert it to HTML
    before insertion.
    function(response) { return newText; }

It exposes the following methods:
  * more()
    manually fetch additional content and attach it to the container
*/
(function(define) {
  define('wirings/infinitecontent', [], function() {
    return function(config) {
      var $;

      return {
        depends: ['jquery'],
        init: function() {
          $ = this.depends('jquery');
          this.more.totalCalls = 0;
        },
        more: function() {
          var self = this;
          var url = this._callUrl(this.more.totalCalls);
          this.more.totalCalls++;

          $.ajax(url, {
            cache: false
          })
          .success(function(data) {
            $(self.elements().root).append(self._callFormat(data));
          });
        },
        _callUrl: function(calls) {
          return config.url(calls);
        },
        _callFormat: function(data) {
          if (config.format) {
            return config.format(data);
          }
          else {
            return data;
          }
        }
      };
    };
  });
}(typeof define == 'function' && define.amd ? define : Atomic));
