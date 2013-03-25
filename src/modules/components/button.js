// button
var Atomic = require('atomic'),
    $$ = require('jquery'),
    Button;

Button = Atomic.OOP.extend(Atomic.AbstractComponent, function (base) {
  var $ = $$;
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