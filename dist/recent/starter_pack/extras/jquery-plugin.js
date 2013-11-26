/*global jQuery:true, Atomic:true */
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
Extra: jQuery Parser Plugin
The jQuery parser plugin is an easy way to hook up Atomic to
jQuery. When enabled, jQuery is given a method .atomic() with
the following parameters

.atomic() [no parameters] or .atomic('parse')
Parse the jQuery selector. Any elements not converted to Atomic
Components will be converted and initialized

.atomic('get')
Return the Atomic Component associated with the jQuery selector
*/
jQuery.fn.atomic = function(action) {
  action = action || '';

  function parse() {
    // an array of the dependencies we need to load for this parse
    // and an object literal to avoid duplicate entries in the array
    var dependencies = [];
    var resolvedDependencies = {};
    var dependenciesCheck = {};

    // a collection if all our matched nodes
    var matched = {};

    var $nodes = jQuery('*[data-atomic]', this);

    // does the current element have a data-atomic attribute?
    if (this.data('atomic') && !this.data('atomic-parsed')) {
      $nodes.add(this);
    }

    // search for all data-atomic nodes. For each one, collect all
    // the related children, add the dependency
    // tag all elements as parsed
    $nodes.each(function(idx, value) {
      var $node = $(value);
      var type = $node.data('atomic');
      var id = $node.data('atomic-id');
      var thisMatch;

      if (!id) {
        throw new Error('could not parse, the following node is missing an id: ' + $node[0]);
      }

      if (matched[id]) {
        throw new Error('an element with an id of ' + id + ' already exists');
      }

      if (!dependenciesCheck[type]) {
        dependencies.push(type);
        resolvedDependencies[type] = null;
        dependenciesCheck[type] = 1;
      }

      $node.data('atomic-parsed', 1);

      matched[id] = {
        $children: jQuery('*[data-atomic-for="' + id +'"]'),
        isA: type,
        node: value
      };
    });

    // load the dependencies
    Atomic.load(dependencies)
    .then(function(resolved) {
      for (var i = 0, len = dependencies.length; i < len; i++) {
        resolvedDependencies[dependencies[i]] = resolved[i];
      }

      // for each matched node, instantiate, assign children
      // then load()
      jQuery.each(matched, function(key, value) {
        var Obj = resolvedDependencies[value.isA];
        var inst = new Obj(value.node);
        $(value.node).data('atomic-component', inst);
        value.$children.each(function(idx, child) {
          var $child = $(child);
          inst.assign(inst.elements[$child.data('atomic-element')], child);
        });
        inst.load();
      });
    });
  }

  // gets one or more Atomic Components for a specified
  // jQuery selector
  function get() {
    var results = [];
    this.each(function(idx, value) {
      var $value = $(value);
      if ($value.data('atomic-component')) {
        results.push($value.data('atomic-component'));
      }
    });
    return results;
  }

  // interface
  switch (action.toLowerCase()) {
  case 'get':
    return get.call(this);
  case 'parse':
  case '':
    return parse.call(this);
  default:
    throw new Error('unknown action: ' + action);
  }
};

if (jQuery('body').data('atomic-autoparse')) {
  jQuery(document).ready(function() {
    jQuery('body').atomic();
  });
}