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
var fs = require('fs');
var app = express();
var wrench = require('wrench');
var __ = require('underscore');
var es = require('esprima');
var venusRegex = /^.*?@venus\-([\w]+?) +([\w\W]+)$/;
var template = fs.readFileSync(path.resolve('./tests/_resources/template.html')).toString();

exec('git describe HEAD', function(err, version) {
  var atomicVersion = version.replace(/[\s]/g, '');

  var tests = {};

  /*
  venus-like to maximize future compatibilty
  /runtest/{testid}
  */
  // 1) scan tests directories with wrench
  // 2) all .js files, extract docblocks
  // 3) all docblocks, extract @venus- annotations
  // 4) store into giant uber registry thing
  var files = wrench.readdirSyncRecursive(path.join(__dirname, './tests'));
  __.each(files, function(file, idx) {
    var read = path.join(__dirname, './tests/', file);
    if (fs.lstatSync(read).isDirectory()) {
      return;
    }

    try {
      var tree = es.parse(fs.readFileSync(read), {
        comment: true,
        tolerant: true
      });

      var annotations = {};
      var hasAnnotations = false;

      __.each(tree.comments, function(comment, cidx) {
        if (comment.type !== 'Block') {
          return;
        }

        __.each(comment.value.split(/\n/), function(line, lidx) {
          var data = line.match(venusRegex);
          if (!data || !data[1] || !data[2]) {
            return;
          }

          if (!annotations[data[1]]) {
            annotations[data[1]] = [];
          }

          hasAnnotations = true;
          annotations[data[1]].push(data[2]);
        });
      });

      if (!hasAnnotations) {
        return;
      }

      // only supporting qunit right now
      if (annotations.library && annotations.library[0].toLowerCase() !== 'qunit') {
        console.log('skipped (not qunit): ' + read);
        return;
      }

      tests[read.replace(/[^a-z0-9]+/gi, '_')] = {
        file: read,
        annotations: annotations
      };
    }
    catch(e) {}
  });

  // when asking for the "tests" collection, return the suites
  app.get('/configtest/qunit-suites.js', function(req, res) {
    var out = [
      'var testSuite = [];'
    ];

    for (var name in tests) {
      out.push('testSuite.push("/runtest/' + name + '");');
    }

    out.push('QUnit.testSuites(testSuite);');

    res.writeHead(200, {
      'Content-Type': 'text/javascript'
    });

    res.end(out.join('\n'));
  });

  // return a test with its files
  app.get('/runtest/:testid', function(req, res) {
    var testId = req.params.testid;
    var details = tests[testId];

    var includes = (details.annotations && details.annotations.include) ? details.annotations.include : [];

    var output = [];
    var useFile = null;
    for (var i = 0, len = includes.length; i < len; i++) {
      useFile = path.resolve(path.dirname(details.file), includes[i]);
      output.push(fs.readFileSync(useFile).toString());
    }

    output.push(fs.readFileSync(details.file).toString());

    res.writeHead(200, {
      'Content-Type': 'text/html'
    });

    res.end(template.replace(/\{\{NAME\}\}/g, testId).replace(/\{\{CODE\}\}/g, output.join('\n')));
  });

  // examples go to the dist's starterpack
  app.get('/examples/scripts/atomic/*', function(req, res) {
    return res.redirect('/starter_pack/'+req.params[0]);
  });

  app.use(express.static(path.normalize(path.join(__dirname))));
  app.use(express.static(path.normalize(path.join(__dirname, './', 'dist', 'atomic-' + atomicVersion))));

  console.log('server initialized');
});

module.exports = app;
