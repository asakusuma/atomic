// selectable
var Atomic = require('atomic'),
    $ = require('jquery'),
    CarouselSelectableBehavior;

CarouselSelectableBehavior = Atomic.Libs.Fiber.extend(Atomic.AbstractBehavior, function (base) {
  return {
    contract: {
      nodes: true,
      data: {required: false, type: 'function'}
    },
    events: {
      SELECTED: 'selected'
    },
    methods: {
      disable: function () {
        this.disabled = true;
      },
      enable: function () {
        this.disabled = false;
      }
    },
    modify: function (done) {
      var myself = this;

      $(this.configuration.nodes).on('click', function (evt) {
        if (myself.disabled) {
          return;
        }
        var results = (this.configuration.data) ? this.configuration.data(evt.target) : {};
        this.trigger(this.events.SELECTED, results);
      });

      done();
    }
  };
});

module.exports = CarouselSelectableBehavior;

