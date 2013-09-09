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
var Atomic = (typeof require === 'function') ? require('atomic') : window.Atomic;
Atomic.pack('components/select', function() { return module; }, function() { return define; }, function() {

  var ENTER = 13,
      ESC = 27,
      TAB = 9;

  // useful constants in this control
  var $;

  // calls the Atomic Component constructor
  return Atomic.Component({
    // a common name to assist in debugging
    name: 'SamplePack Select by @erowell',

    // depends on
    depends: ['jquery'],

    // no additional nodes needed
    elements: {},

    // events
    events: {},

    /**
     * Main wiring function
     * @method Select#wiring
     */
    init: function() {
      $ = this.depends('jquery');
      var node = this.node = $(this.getRoot());

      this._build();
      this._bind();
      this.sync();
      // console.log('Initialized Select');
    },
    /**
    * sync atomic select with native select
    * @method Select#sync
    */
    sync: function() {
      this.syncContainer();
      this.syncViewport();
      this.syncList();
    },
    /**
    * sync atomic select container position with native select position
    * @method Select#syncContainer
    */
    syncContainer: function() {
      this.container.offset(this.node.offset());
    },
    /**
    * sync atomic select list with native select options
    * @method Select#syncList
    */
    syncList: function() {
      var node = this.node,
          viewport = this.viewport,
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

      ul.width(node.outerWidth());

      this.syncListSelected();
    },
    /**
    * sync atomic select list selected state with native select selected state
    * @method Select#syncListSelected
    */
    syncListSelected: function() {
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
    /**
    * open the drop down
    * @method Select#open
    */
    open: function() {
      this.container.addClass('open');
      this.ul.show();
    },
    /**
    * close the drop down
    * @method Select#close
    */
    close: function() {
      var container = this.container;
      container.removeClass('open');
      this.ul.hide();
    },
    /**
    * check if the drop down is open or not
    * @method Select#isOpen
    */
    isOpen: function() {
      return this.container.hasClass('open');
    },
    /**
    * sync atomic select viewport with native select viewport
    * @method Select#syncViewport
    */
    syncViewport: function() {
      var node = this.node,
          viewport = this.viewport;

      viewport.width(node.outerWidth());
      viewport.height(node.outerHeight());
      this.syncViewportText();
    },
    /**
    * sync atomic select viewport text with native select viewport text
    * @method Select#syncViewportText
    */
    syncViewportText: function() {
      this.viewport.text(this.node.val());
    },
    /**
    * focus the native select element tied to the atomic select
    * @method Select#syncViewportText
    */
    focus: function() {
      this.node.focus();
    },
    _bind: function() {
      var that = this,
          node = this.node,
          viewport = this.viewport,
          container = this.container,
          ul = this.ul;

      node.on('change', function() {
        that.sync();
      });

      node.on('focus', function() {
        container.addClass('focused');
      });

      node.on('blur', function() {
        container.removeClass('focused');
      });

      viewport.on('click', function() {
        if (that.isOpen()) {
          that.close();
        }
        else {
          that.open();
        }

        that.focus();
      });

      // when user clicks on an atomic select item,
      // update the native select and then close the ul
      ul.on('click', function(evt) {
        var target = $(evt.target);

        node.val(target.text());

        that.syncViewportText();
        that.syncListSelected();
        that.close();
      });

      ul.on('mousedown', function(evt) {
        evt.preventDefault();
      });

      $(document.body).on('click', function(evt) {
        var atomicSelect = $(evt.target).closest('.atomic-select');
        if (!atomicSelect.length) {
          that.close();
        }
      });

      $(document).keydown(function(evt) {
        var key = evt.which;

        if (key === ENTER || key === ESC || key === TAB) {
          if (that.isOpen()) {
            that.close();
            evt.preventDefault();
          }
        }
      });

    },
    _build: function() {
      var container = this.container = $(document.createElement('div')),
          ul = this.ul = $(document.createElement('ul')),
          viewport = this.viewport = $(document.createElement('div')),
          node = this.node;

      ul.css('position', 'absolute');
      viewport.addClass('viewport');

      this.close();

      // build mirror
      container.append(viewport)
        .append(ul)
        // copy over classes from select to container
        // TODO: maybe we should add the class copy logic to abstract along with atomic-* - Eric
        .attr('class', node.attr('class'))
        .addClass('atomic-select')
        .attr('role', 'presentation')
        .css('display', 'inline-block')
        .css('position', 'relative')
        .css('position', 'absolute');

      // append container after select
      node.after(container);
    }


  });
});
