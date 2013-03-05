// button
var Fiber = require('lib/fiber'),
    $ = require('jquery'),
    AbstractComponent = require('util/abstractcomponent'),
    Button;

Button = Fiber.extend(AbstractComponent, function (base) {
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