/*jshint node:true */

/*
Atomic
Copyright 2011 LinkedIn

Licensed under the Apache License, Version 2.0 (the 'License');
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an 'AS
IS' BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

var path = require('path');
var express = require('express');
var exec = require('child_process').exec;
var app = express();
var dust = require('dustjs-linkedin');
var cons = require('consolidate');


app.configure(function() {
  app.set('template_engine', 'dust');
  app.set('view engine', 'dust');
  app.engine('dust', cons.dust);
  app.set('views', __dirname + '/views');
});


function buildComponentPage() {
  return function(req, res) {
    var component = req.params[0];
    res.render('page', { 
      component: component 
    });
  };
}

app.get('/component/*', buildComponentPage());

//starter_pack/components/button.js

//app.use(express.static(path.normalize(path.join(__dirname))));
app.use(express.static(path.normalize(path.join(__dirname, './'))));
//app.use(express.static(path.normalize(path.join(__dirname, './', 'tests', 'ui', 'scripts'))));

module.exports = app;
