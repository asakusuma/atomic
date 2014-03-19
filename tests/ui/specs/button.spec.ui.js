casper.test.begin('Test button', 1, function suite(test) {

    casper.start('http://localhost:5000/component/button');

    casper.on('page.error', function(message, error) {
        this.echo(message + ' = ' + error);
    });

    casper.waitForSelector('#last-event');

    casper.then(function() {
        this.mouseEvent('click', '#target');
    });

    casper.waitForSelector('#last-event[value="USE"]', function() {
        test.assert(true);
    });

    casper.run(function() {
        test.done();
    });
});