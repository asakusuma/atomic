var button;

Atomic.load('components/button')
.then(Atomic.expand(function(Button) {
  // build the button and add echo wiring
  button = new Button(document.getElementById('target'));
  button.resolve('jquery', $);

  button.load().then(function() {

    button.on('USE', function() {
        document.getElementById('last-event').setAttribute('value', 'USE');
    });

    $('body').append('<input name="ready" type="hidden" value="true" />');
    $('body').append('<input id="last-event" type="hidden" name="last-event" value="" />');
  });
}));