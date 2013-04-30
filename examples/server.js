/*
 * express server to show off our examples
 */

var express = require('express');
var app = express();
app.get('/', function(req, res) {
  res.send('hello!');
});
module.exports = app;
