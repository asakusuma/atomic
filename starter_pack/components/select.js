/*global require:true, module:true, define:true */
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
============================================================
STARTER PACK COMPONENTS
============================================================
Components are the building blocks of rich UIs. Their purpose
in life is to augment an existing HTML element on the page
and make it produce new events, accept additional
configuration, and add/remove classes as required. By
default, Components do not depend on anything other than Atomic
itself. Often times, developers will use a DOM Library such
as YUI or jQuery to make the DOM operations easier.

The Select component creates a mirror of a native select component.
When the select component is updated, or interacted with, the mirror reflects
those changes.  The Atomic Select mirror sits on top of the original select box
*/
var Atomic = require('atomic');

function definition() {
  // useful constants in this control
  var $ = require('jquery');

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack Select by @erowell',

    // no dependencies
    needs: [],

    // no additional nodes needed
    nodes: {},

    // events
    events: {},

    /**
     * Main wiring function
     * @method Select#wiring
     */
    wiring: function() {
      var node = this.node = $(this.getRoot());

      this._build();
      this._bind();
      this.sync();
      console.log('Initialized Select');
    },
    /**
    * completely sync atomic mirror with native select.  This includes positioning,
    * options, classes, the viewport, hover states, etc.
    * @method Select#sync
    */
    sync: function() {
      var node = this.node,
          ul = this.ul,
          li;

      // clear list items
      ul.text('');

      // build ul for mirror
      node.find('option').each(function() {
        li = $(document.createElement('li'));
        li.text($(this).val());
        ul.append(li);
      });

      //this.container.offset(node.offset());

      this.syncViewport();
      this.syncList();
    },
    syncList: function() {
      var ul = this.ul,
          option;

      ul.find('li').removeClass('selected');

      this.node.find('option').each(function() {
        option = $(this);
        if (option.is(':selected')) {
          $(ul.find('li')[option.index()]).addClass('selected');
        }
      });
    },
    _bind: function() {
      var that = this,
          node = this.node,
          viewport = this.viewport,
          ul = this.ul;

      node.on('change', function() {
        that.sync();
        ul.hide();
      });

      viewport.on('click', function() {
        ul.toggle();
      });

      // when user clicks on an atomic select item,
      // update the native select and then close the ul
      ul.on('click', function(evt) {
        var target = $(evt.target);

        node.val(target.text());

        that.syncViewport();
        that.syncList();
        ul.hide();
      });

    },
    syncViewport: function() {
      this.viewport.text(this.node.val());
    },
    _build: function() {
      var container = this.container = $(document.createElement('div')),
          ul = this.ul = $(document.createElement('ul')),
          viewport = this.viewport = $(document.createElement('div')),
          node = this.node;

      ul.css('position', 'absolute')
        .hide();

      // build mirror
      container.append(viewport)
        .append(ul)
        // copy over classes from select to container
        .attr('class', node.attr('class'))
        .addClass('atomic-select')
        .css('display', 'inline-block')
        .css('position', 'relative');
        //.css('position', 'absolute');

      // append container after select
      node.after(container);
    }


  });
}
// you only need to set .id if you are using the "system" loader
definition.id = 'components/select';

Atomic.export(module, define, definition);