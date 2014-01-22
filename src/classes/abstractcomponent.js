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

/**
 * AbstractComponent a template for creating Components in Atomic
 * Components are the lego blocks of Atomic. They emit events
 * at interesting moments, and can be combined with additional
 * components to create Composites.
 * @class AbstractComponent
 */
(function(Atomic) {
  var AbstractComponent = Atomic._.Fiber.extend(function (base) {
    return {
      /**
       * A simple ID to be overridden. Useful in debugging
       * @property {String} AbstractComponent#name
       */
      name: 'AbstractComponent. Override me to improve debugging',
    
      /**
       * The module path for this. Used in debugging and BEM syntax
       * @property {String} id
       */
      id: 'abstractcomponent',

      /**
       * An array of dependencies this module needs to run
       * These are modules the implementing component needs
       * @property {Array} AbstractComponent#depends
       */
      depends: [],

      /**
       * A key/string collection of nodes and their purpose
       * These are nodes that components need to have in order to function.
       * This object is overriden with an instance variable during the constructor
       * @property {Object} AbstractComponent#elements
       */
      elements: {},

      /**
       * A key/string collection of events
       * These are events that the AbstractComponent can emit
       * Overriden with an instance variable during the constructor
       * @property {Object} AbstractComponent#events
       */
      events: {},
    
      /**
       * A key/string collection of states
       * These allow a developer to document the states used in the
       * component. In order to set state using this.state(), you will
       * also need to have the state object registered here
       * to ensure all states are documented.
       * @property {Object} AbstractComponent#states
       */
      states: {},

      /**
       * A configuration for this instance of the object
       * contains any unknown key/value pairs passed into the
       * constructor
       * @property {Object} AbstractComponent#config
       */
      config: {},

      /**
       * The real initialization function when called in response to load
       * This is where app logic resides
       * @property {Array} AbstractComponent#_init
       * @private
       */
      _init: null,
    
      /**
       * The internal state object
       * @property {Object} AbstractComponent#_state
       * @private
       */
      _state: {},

      /**
       * A local event emitter
       * @property {EventEmitter} AbstractComponent#_eventEmitter
       * @private
       */
      _eventEmitter: null,
    
      /**
       * A local event emitter
       * used for the observer channel to forcibly separate events from observe
       * @property {EventEmitter} AbstractComponent#_observableEmitter
       * @private
       */
      _observableEmitter: null,

      /**
       * Has this object been destroyed
       * @property {Boolean} AbstractComponent#_isDestroyed
       * @private
       */
      _isDestroyed: false,

      /**
       * The initializer for a component
       * The optional el, if provided, will then perform an attach on
       * your behalf.
       * @constructor
       * @param {HTMLElement} el - an optional HTML element
       * @param {Object} overrides - any configuration overrides to provide to this object
       */
      init: function (el, overrides) {
        var name, nodeName;

        // set assigned, etc all to local instance-level variables
        this._init = function() {};
        this.config = {};
        this._eventEmitter = new Atomic._.EventEmitter({
          wildcard: false,
          newListener: false,
          maxListeners: 20
        });
        this._observableEmitter = new Atomic._.EventEmitter({
          wildcard: false,
          newListener: false,
          maxListeners: 0
        });
      
        this.elements.root = 'The root HTML node of this component (automatically generated)';

        // localize the nodes/events/needs variable BEFORE the user starts configuring
        // nodes and needs can accept overwriting
        this.elements = createDisplayableObject(this.elements, true);
        this.events = createDisplayableObject(this.events, true, true);
        this.states = createDisplayableObject(this.states, true, true);
        this.depends = createDisplayableObject(this.depends);

        // attach the el
        if (el) {
          this.attach(el);
        }

        // handle overrides
        if (overrides) {
          for (name in overrides) {
            if (!overrides.hasOwnProperty(name)) {
              continue;
            }
            if (typeof(this[name]) === 'function') {
              // can't override a function here
              continue;
            }
            else if (name.indexOf('_') === 0) {
              // can't override a _ property here
              continue;
            }
            else if (name === 'depends' || name === 'events' || name === 'config') {
              // needs and events should be wired in. using config for this is just silly
              continue;
            }
            else if (name === 'elements') {
              for (nodeName in overrides.elements) {
                if (overrides.elements.hasOwnProperty(nodeName)) {
                  this.elements._.set(nodeName, overrides.elements[nodeName]);
                }
              }
            }
            else {
              // everything else is assigned to config
              this.config[name] = overrides[name];
            }
          }
        }
      },

      /**
       * Assign a node to the component.elements collection
       * @method AbstractComponent#assign
       * @param {String} name - the node to assign. Use a component.elements reference
       * @param {HTMLElement} el - an element to assign to the role.
       */
      assign: function(name, el) {
        // make sure this is an element that is allowed
        if (!this.elements._.exists(name)) {
          throw new Error('Invalid element: ' + name + '. Only elements defined in this.elements:{} may be assigned');
        }
      
        this.elements._.set(name, el);
        return this;
      },
	
      /**
       * Assign a dependency to the component.depends collection
       * @method AbstractComponent#resolve
       * @param {String} name - the dependency to resolve. Use a component.depends reference
       * @param {Object} obj - the resolved object
       */
      resolve: function(name, obj) {
        // make sure this is an dependency that is allowed to be resolved
        if (!this.depends._.exists(name)) {
          throw new Error('Invalid dependency: ' + name + '. Only dependencies defined in this.depends:[] may be resolved');
        }
      
        this.depends._.set(name, obj);
        return this;
      },

      /**
       * Destroy the object, removing DOM element and event bindings
       * @method AbstractComponent#destroy
       */
      destroy: function () {
        this._isDestroyed = true;
        this.offAny();
        if(this.elements().root.parentNode) {
          this.elements().root.parentNode.removeChild(this.elements().root);
        }
        this.removeAllListeners();
        return null;
      },

      /**
       * Listen for events emitted by the Component
       * @method AbstractComponent#on
       * @param {String} name - the event name
       * @param {Function} fn - the callback function
       */
      on: function (name, fn) {
        if (name ===  '*') {
          this._eventEmitter.onAny(fn);
        }
        else {
          this._eventEmitter.on(name, fn);
        }
        return this;
      },

      /**
       * Remove an event added via on
       * @method AbstractComponent#off
       * @param {String} name - the name to remove callbacks from
       * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
       */
      off: function (name, fn /* optional */) {
        if (name === '*') {
          if (!fn) {
            this._eventEmitter.offAll(name);
          }
          else {
            this._eventEmitter.offAny(fn);
          }
        }
        else {
          this._eventEmitter.off(name, fn);
        }
        return this;
      },

      /**
       * Queue a callback to run once, and then remove itself
       * @method AbstractComponent#onOnce
       * @param {String} name - the event name
       * @param {Function} fn - the callback function
       */
      onOnce: function (name, fn) {
        this._eventEmitter.onOnce(name, fn);
        return this;
      },

      /**
       * set the maximum number of listeners this component can support
       * highly interactive components can increase the base number,
       * but setting arbitrarily large numbers should be a performance
       * warning.
       * @method AbstractComponent#setMaxListeners
       * @param {Number} count - the max number of listeners
       */
      setMaxListeners: function (count) {
        this._eventEmitter.setMaxListeners(count);
        return this;
      },

      /**
       * Get a list of all the current listeners
       * @method AbstractComponent#listeners
       * @returns {Array}
       */
      listeners: function (name) {
        var anyListeners = this._eventEmitter.listenersAny();
        var listeners = this._eventEmitter.listeners(name);
        return listeners.concat(anyListeners);
      },

      /**
       * Trigger an event
       * This triggers the specified event string, calling all
       * listeners that are subscribed to it.
       * @method AbstractComponent#trigger
       * @param {String} name - the event name
       * @param {Object} ... - any additional arguments to pass in the event
       */
      trigger: function () {
        var args = [].slice.call(arguments, 0);
        var name = args[0];
      
        // make sure this is an event that is allowed to be triggered
        if (!this.events._.exists(name)) {
          throw new Error('Invalid event: ' + name + '. Only events defined in this.events:{} may be triggered');
        }
      
        this._eventEmitter.emit.apply(this._eventEmitter, args);
        return this;
      },

      /**
       * Provides an easy way to link an event and method
       * @method AbstractComponent#bind
       * @param {Object} eventing - an eventing object
       * @param {String} eventName - the name of the event to listen to
       * @param {String|Function} method - the method to invoke. If a string, resolves under this.*
       */
      bind: function (eventing, eventName, method) {
        if (typeof method === 'string') {
          eventing.on(eventName, Atomic.proxy(this[method], this));
        }
        else {
          eventing.on(eventName, method);
        }
        return this;
      },

      /**
       * Remove a bind() operation
       * @method AbstractComponent#unbind
       * @param {Object} eventing - an eventing object
       * @param {String} eventName - optional. an event name to unsubscribe from
       * @param {String|Function} method - optional. the method to remove. If a string, resolves under this.*
       */
      unbind: function (eventing, eventName, method) {
        if (typeof method === 'string') {
          eventing.off(eventName, this[method]);
        }
        else if (typeof method === 'function') {
          eventing.off(eventName, method);
        }
        else {
          eventing.off(eventName);
        }
        return this;
      },

      /**
       * Wrap a method with a new function
       * The new function gets the old function as its first parameter
       * @method AbstractComponent#wrap
       * @param {String} method - method to augment
       * @param {Function} fn - custom function to execute. Gets the original function as the first arg
       */
      wrap: function(method, fn) {
        var old = Atomic.proxy(this[method], this);
        var that = this;
        this[method] = function() {
          var args = [].slice.call(arguments, 0);
          args.unshift(old);
          return fn.apply(that, args);
        };
        return this;
      },
    
      /**
       * Proxy a function into a new scope.
       * @method AbstractComponent#proxy
       * @param {Function} fn - a function to proxy
       * @param {Object} scope - the scope to run the function in
       * @returns {Function}
       */
      proxy: function(fn, scope) {
        return function() {
          fn.apply(scope, arguments);
        };
      },

      /**
       * Attach an element to this Component
       * @method AbstractComponent#attach
       * @param {HTMLElement} el - an HTML element to attach
       * @returns this
       */
      attach: function (el) {
        this.assign('root', el);
        return this;
      },

      /**
       * get the root node
       * @method AbstractComponent#getRoot
       * @returns {HTMLElement}
       */
      getRoot: function () {
        return this.elements().root;
      },
    
      /**
       * Provides a helper for Block__Element--Modifier syntax
       * We use BEM internally in the objects in order to provide a consistent way to
       * manage CSS classes. The BEM helper creates class names in BEM syntax style
       * @method AbstractComponent#BEM
       * @param {String} element - the element part of the BEM syntax or null
       * @param {String} modifier - the modifer part of the BEM syntax or null
       * @returns {String}
       */
      BEM: function(element, modifier) {
        var className = this.id.replace(/[^A-Z0-9\-\_]/gi, '-');
        if (element) {
          className += '__' + element;
        }
        if (modifier) {
          className += '--' + modifier;
        }
        return className;
      },
    
      /**
       * Add a class to an element, helper in case jQuery or such isn't available
       * @method AbstractComponent#addClass
       * @param {HTMLElement} el - the HTML element
       * @param {String} klass - the classname to add
       * @returns this
       */
      addClass: function(el, klass) {
        var className = el.className;
        if (!hasClass(el, klass)) {
          className += ' ' + klass.replace(/[^A-Z0-9\-\_]/gi, '-');
          className = className.replace(/^\s+|\s+$/g, '');
        }
        el.className = className;
        return this;
      },
    
      /**
       * Removes a class from an element, helper in case jQuery or such isn't available
       * @method AbstractComponent#removeClass
       * @param {HTMLElement} el - the HTML element
       * @param {String} klass - the classname to add
       * @returns this
       */
      removeClass: function(el, klass) {
        var className = el.className;
        className = className.replace(new RegExp('(?:^|\\s)' + klass.replace(INVALID_CLASS_CHARACTERS, '-') + '(?!\\S)', 'g') , '');
        className = className.replace(/^\s+|\s+$/g, '');
        el.className = className;
        return this;
      },
    
      /**
       * Wait for the async completion of a function
       * @see Atomic.when
       */
      when: function() {
        return Atomic.when.apply(Atomic, arguments);
      },
    
      /**
       * Wait for the async completion of a collection of functions
       * @see Atomic.whenAll
       */
      whenAll: function() {
        return Atomic.whenAll.apply(Atomic, arguments);
      },

      /**
       * Load the Component, resolve all dependencies
       * calls the ready method
       * @method AbstractComponent#load
       * @param {Object} cb - a callback to run when this is loaded
       */
      load: function (cb) {
        if (this.elements().root) {
          this.addClass(this.elements().root, this.BEM());
          this.addClass(this.elements().root, this.BEM(this.elements.root));
          this.addClass(this.elements().root, this.BEM(null, 'loading'));
        }
        var deferred = Atomic.deferred();
        var self = this;
        var fetch = [];
        var allDependencies = this.depends._.raw();
        var allResolvedDependencies = this.depends();
        var fetchLen;
      
        // only fetch things we don't have a resolved value for
        for (var i = 0, len = allDependencies.length; i < len; i++) {
          if (!allResolvedDependencies[allDependencies[i]]) {
            fetch.push(allDependencies[i]);
          }
        }

        Atomic.load.apply(Atomic, fetch)
        .then(function(values) {
          var wiringDeferred = Atomic.deferred(),
              promise,
              i,
              n;

          // populate values resolution into the this.depends()
          for (i = 0, fetchLen = fetch.length; i < fetchLen; i++) {
            self.depends._.set(fetch[i], values[i]);
          }

          // dynamically create promise chain
          promise = Atomic.when(self._init.call(self));

          // if there is a callback, we can then handle it
          // by attaching it to the end of the promise chain
          if (cb) {
            promise = promise.then(cb);
          }

          // set resolution for the internal promise
          promise.then(function() {
            wiringDeferred.fulfill();
          }, function(err) {
            wiringDeferred.reject(err);
          });

          // return the promise to the outer function
          // if we hit a throw(), it'll automatically bubble out
          // to the outer promise layer thanks to the promise chain
          // above
          return wiringDeferred.promise;
        })
        .then(function() {
          var els = self.elements._.raw();
          for (var name in els) {
            if (els.hasOwnProperty(name) && self.elements()[name]) {
              self.addClass(self.elements()[name], self.BEM(name));
            }
          }
          if (self.elements().root) {
            self.removeClass(self.elements().root, self.BEM(null, 'loading'));
          }
          deferred.fulfill();
        }, function(err) {
          if (self.elements().root) {
            self.removeClass(self.elements().root, self.BEM(null, 'loading'));
            self.addClass(self.elements().root, self.BEM(null, 'failed'));
          }
          deferred.reject(err);
        });

        return deferred.promise;
      },

      /**
       * Adds additional functions and properties to this Component
       * wiring is done in response to a load() call.
       * @method AbstractComponent#wire
       * @param {Function|Object|AbstractWiring} wiring - a functon to run in response to load(), or an object
       *  literal containing an init function to be executed with load(), and public methods
       *  to decorate the component instance
       */
      wire: function(wiring) {
        var name, nodesName, eventsName, i, len, properties, cleanName;
        var wrapsPre = /^[\[\]]/;
        var wrapsPost = /[\[\]]$/;
        var self = this;
      
        function noop() {
          return function() {};
        }
      
        function wrapInit(obj, fn) {
          obj.wrap('_init', function(prev) {
            prev();
            fn.call(obj);
          });
        }
      
        // if the wiring is a function and has the __atomic property, error
        // if just a function, it's an "init"
        // if it's an object, it's already a wiring ready to go
        if (typeof wiring === 'function') {
          if (wiring.__atomic) {
            throw new Error('Atomic Wirings must be configured (by invoking their function) and passing their return value into wire()');
          }
          properties = {
            init: wiring
          };
        }
        else {
          properties = wiring;
        }
      
        // iterate through the keys. For each key, handle it
        for (name in properties) {
          if (!properties.hasOwnProperty(name)) {
            continue;
          }
        
          cleanName = name.replace(wrapsPre, '').replace(wrapsPost, '');
        
          if (cleanName == '_init') {
            throw new Error('You cannot wire in "_init" as it\'s a reserved method. Please use "init" without the underscore.');
          }
        
          // events requires special handling as a property
          if (name === 'events') {
            for (eventsName in properties.events) {
              if (properties.events.hasOwnProperty(eventsName)) {
                this.properties._.add(eventsName, properties.events[eventsName]);
              }
            }
            continue;
          }
        
          // the elements collection requires special handling, and doesn't overwrite
          // any elements that may have been already defined
          if (name === 'elements') {
            for (nodesName in properties.elements) {
              if (this.elements[nodesName]) {
                continue; // we do not overwrite if the Implementor has defined
              }
              this.elements._.add(nodesName, properties.elements[nodesName]);
            }
            continue;
          }
        
          // the depends collection requires special handling
          if (name === 'depends') {
            for (i = 0, len = properties.depends.length; i < len; i++) {
              this.depends._.add(properties.depends[i]);
            }
            continue;
          }
        
          // by default, init is a wrapped function unless you turn on clobbering
          if (name === 'init' || cleanName === 'init') {
            // init methods are always done with wrapping unless disabled
            if (name === ']init[') {
              this._init = properties[name];
            }
            else {
              wrapInit(this, properties[name]);
            }
            continue;
          }
        
          if (typeof properties[name] === 'function') {
            if (!this[cleanName]) {
              this[cleanName] = noop();
            }

            // the default behavior is to clobber
            // however, if we are told to wrap, we will
            if (cleanName !== name) {
              if (name.indexOf('[') === 0) {
                this.wrap(cleanName, properties[name]);
              }
            }
            else {
              this[cleanName] = properties[name];
            }
            continue;
          }
        }
        return this;
      },

      /**
       * Overloaded state function for setting and getting the state
       * @method AbstractComponent#state
       * @param {Object|String} Either the key to be retrieved or set, or an object
       *   literal representing the new state or an extension of the new state
       * @param {*} value - Either the value to be set, or a boolean specifying the object
       *   in arg[0] should overwrite the existing state
       */
      state: function(one, two, undefined) {
        var args = [].slice.call(arguments, 0);
        var name;
        var values = {};
        var stateChanges = [];
        var newState = null;

        if (typeof args[1] === 'undefined') {
          if (typeof args[0] === 'undefined') {
            for (name in this._state) {
              if (this._state.hasOwnProperty(name)) {
                values[name] = this._state[name].value;
              }
            }
            return values;
          }
          else if (typeof args[0] === 'string') {
            return this._state[args[0]].value;
          }
        }
      
        if(typeof args[0] === 'object') {
          for (name in args[0]) {
            if (args[0].hasOwnProperty(name)) {
              if (!this.states._.exists(name)) {
                throw new Error('Invalid state: ' + name + '. Only states defined in this.states:{} may be set');
              }
              // overwrite if "true" or not set yet
              if (args[1]) {
                // overwrite
                this._state[name].rev++;
                this._state[name].lastValue = this._state[name].value;
                this._state[name].value = args[0][name];
              }
              else if (typeof this._state[name] === 'undefined') {
                // never defined, new state object
                this._state[name] = {
                  rev: 0,
                  value: args[0][name],
                  lastValue: undefined
                };
              }
              
              stateChanges.push(name);
            }
          }
        }
      
        if (typeof args[0] === 'string') {
          if (!this.states._.exists(args[0])) {
            throw new Error('Invalid state: ' + args[0] + '. Only states defined in this.states:{} may be set');
          }
          if (typeof this._state[args[0]] === 'undefined') {
            this._state[args[0]] = {
              rev: 0,
              value: args[1],
              lastValue: undefined
            };
          }
          else {
            this._state[args[0]].rev++;
            this._state[args[0]].lastValue = this._state[args[0]].value;
            this._state[args[0]].value = args[1];
          }
          stateChanges.push(args[0]);
        }
      
        // we should have a set of items in stateChanges we need to now trigger observer
        // changes for each changed item
        for (var i = 0, len = stateChanges.length; i < len; i++) {
          newState = this._state[stateChanges[i]];
          this._observableEmitter.emit(stateChanges[i], newState.value, newState.lastValue, newState.rev);
        }

        if(stateChanges.length > 0) {
          return this.render();
        }
      
        return this;
      },
    
      /**
       * Listen for data changes in the state
       * @method AbstractComponent#observe
       * @param {String} name - the data name
       * @param {Function} fn - the callback function
       */
      observe: function (name, fn) {
        if (name ===  '*') {
          this._observableEmitter.onAny(fn);
        }
        else {
          this._observableEmitter.on(name, fn);
        }
        return this;
      },

      /**
       * Remove a listener for data changes
       * @method AbstractComponent#unobserve
       * @param {String} name - the data name to remove callbacks from
       * @param {Function} fn - optional. if excluded, it will remove all callbacks under "name"
       */
      unobserve: function (name, fn /* optional */) {
        if (name === '*') {
          if (!fn) {
            this._observableEmitter.offAll(name);
          }
          else {
            this._observableEmitter.offAny(fn);
          }
        }
        else {
          this._observableEmitter.off(name, fn);
        }
        return this;
      },

      /**
       * Can be overriden to apply the component's internal state to the DOM
       * @method render
       * @returns this
       */
      render: function() {
        return this;
      }
    };
  });
  
  Atomic._.AbstractComponent = AbstractComponent;
}(Atomic));
