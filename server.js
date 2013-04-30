/*global __dirname:true */
// server.js file

var path = require('path');
var express = require('express');
var exec = require('child_process').exec;
var app = express();

exec('git describe HEAD', function(err, version) {
  var atomicVersion = version.replace(/[\s]/g, '');

  app.use(express.static(path.normalize(__dirname)));

  // this makes atomic.js and atomic.min.js local from /
  app.use(express.static(path.normalize(path.join(__dirname, './', 'dist', 'atomic-' + atomicVersion))));
});

module.exports = app;