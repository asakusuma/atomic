// button
var Trinket = require('trinket'),
    $ = require('jquery'),
    Button;

Button = Trinket.Libs.Fiber.extend(Trinket.AbstractComponent, function (base) {
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