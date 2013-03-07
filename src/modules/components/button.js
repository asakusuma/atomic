// button
var Atomic = require('atomic'),
    $ = require('jquery'),
    Button;

Button = Atomic.Libs.Fiber.extend(Atomic.AbstractComponent, function (base) {
  return {
    events: {
      USE: 'use'
    },
    onAttach: function () {
      var $el = $(this.ELEMENT),
          button = this;

      $el.on('click', function () {
        button.trigger(button.events.USE);
      });
    }
  };
});

module.exports = Button;