// selectable
var Atomic = require('atomic'),
    $ = require('jquery'),
    CarouselSelectableBehavior;

CarouselSelectableBehavior = Atomic.Libs.Fiber.extend(Atomic.AbstractBehavior, function (base) {
  return {
    events: {
      SELECTED: 'selected'
    },
    contract: {
      nodes: true,
      data: {required: false, type: 'function'}
    },
    modify: function (done) {
      var disabled = false;
      $(this.options.nodes).on('click', function (evt) {
        if (disabled) {
          return;
        }
        var results = (this.options.data) ? this.options.data(evt.target) : {};
        this.trigger(this.events.SELECTED, results);
      });

      this.addMethod('disable', function () {
        disabled = true;
      });
      this.addMethod('enable', function () {
        disabled = false;
      });

      done();
    }
  };
});

module.exports = CarouselSelectableBehavior;

