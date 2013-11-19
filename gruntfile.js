/*
Atomic
Copyright 2013 LinkedIn

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an "AS
IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
express or implied.   See the License for the specific language
governing permissions and limitations under the License.
*/

// gruntfile.js
var path = require('path');

module.exports = function (grunt) {

  grunt.initConfig({
    output_files: {
      main:         './dist/atomic-__ATOMIC__VERSION__/atomic.js',
      main_min:     './dist/atomic-__ATOMIC__VERSION__/atomic.min.js',
      license:      './dist/atomic-__ATOMIC__VERSION__/LICENSE',
      readme:       './dist/atomic-__ATOMIC__VERSION__/README.md',
      starterPack:  './dist/atomic-__ATOMIC__VERSION__/starter_pack/',
      compat:       './dist/atomic-__ATOMIC__VERSION__/compat/'
    },
    last_output_files: {
      main:         './dist/recent/atomic.js',
      main_min:     './dist/recent/atomic.min.js',
      license:      './dist/recent/LICENSE',
      readme:       './dist/recent/README.md',
      starterPack:  './dist/recent/starter_pack/',
      compat:       './dist/recent/compat/'
    },
    zip_locations: {
      archive:      'atomic-__ATOMIC__VERSION__.tgz',
      path:         'atomic-__ATOMIC__VERSION__'
    },
    atomic_version: null,
    anonymous_header: '!(function(context, undefined){\n',
    anonymous_footer: '\n;context.Atomic.version = "__ATOMIC__VERSION__";\n})(this);',
    pkg: grunt.file.readJSON('package.json'),

    /**
     * clean: clean up temp and artifact directories
     */
    clean: {
      tmp: ['./tmp'],
      dist: ['./dist/atomic*']
    },

    /**
     * shell: run shell commands. We use this for git ops
     */
    shell: {
      tag: {
        command: 'git describe HEAD',
        options: {
          callback: function(err, stdout, stderr, next) {
            var foot = grunt.config.get('anonymous_footer');
            var output_files = grunt.config.get('output_files');
            var zip_locations = grunt.config.get('zip_locations');
            var version = stdout.replace(/[\s]/g, '');
            var file;
            var type;

            function addVersion(str) {
              return str.replace(/__ATOMIC__VERSION__/g, version);
            }

            // set the atomic version everywhere we need to
            grunt.config.set('anonymous_footer', addVersion(foot));
            grunt.config.set('atomic_version', version);
            for (type in output_files) {
              file = grunt.config.get('output_files.'+type);
              grunt.config.set('output_files.'+type, addVersion(file));
            }
            for (type in zip_locations) {
              file = grunt.config.get('zip_locations.'+type);
              grunt.config.set('zip_locations.'+type, addVersion(file));
            }

            next();
          }
        }
      },
      venus: {
        command: 'node ./node_modules/venus/bin/venus "tests/" -e ghost',
        options: {
          stdout: true
        }

      },
      venus_browser: {
        command: 'node ./node_modules/venus/bin/venus run -t "tests/"',
        options: {
          stdout: true
        }
      }
    },

    /**
     * copy: copy files that need no modification
     */
    copy: {
      fiber: {
        files: [
          {src: ['./node_modules/fiber/src/fiber.js'], dest: './tmp/lib/fiber/fiber.js', filter: 'isFile'}
        ]
      },
      atomic: {
        files: [
          {src: './tmp/atomic.js', dest: '<%=output_files.main %>', filter: 'isFile'},
          {src: './tmp/atomic.min.js', dest: '<%=output_files.main_min %>', filter: 'isFile'},
          {src: './tmp/atomic.js', dest: '<%=last_output_files.main %>', filter: 'isFile'},
          {src: './tmp/atomic.min.js', dest: '<%=last_output_files.main_min %>', filter: 'isFile'}
        ]
      },
      text: {
        files: [
          {src: ['./LICENSE'], dest: '<%= output_files.license %>', filter: 'isFile'},
          {src: ['./README.md'], dest: '<%= output_files.readme %>', filter: 'isFile'},
          {src: ['./LICENSE'], dest: '<%= last_output_files.license %>', filter: 'isFile'},
          {src: ['./README.md'], dest: '<%= last_output_files.readme %>', filter: 'isFile'}
        ]
      },
      starterPack: {
        files: [
          {expand: true, cwd: './starter_pack/', src: ['**'], dest: '<%= output_files.starterPack %>'},
          {expand: true, cwd: './starter_pack/', src: ['**'], dest: '<%= last_output_files.starterPack %>'}
        ]
      },
      compat: {
        files: [
          {expand: true, cwd: './src/compat/', src: ['**'], dest: '<%= output_files.compat %>'},
          {expand: true, cwd: './src/compat/', src: ['**'], dest: '<%= last_output_files.compat %>'}
        ]
      }
    },
    
    /**
     * Do a bower install of browser-ready components Atomic needs
     */
    bower: {
      install: {
        options: {
          targetDir: './tmp/lib',
          layout: 'byComponent',
          install: true,
          verbose: false,
          cleanTargetDir: true,
          cleanBowerDir: true
        }
      }
    },

    /**
     * jshint: perform jshint operations on the code base
     */
    jshint: {
      all: {
        files: {
          src: [
            './gruntfile.js',
            './examples/scripts/**/*.js',
            './src/atomic/*.js',
            './src/compat/*.js',
            './src/customizable/*.js',
            './starter_pack/**/*.js',
            './src/*.js',
            './tests/src/**/*.js',
            './tests/integration/**/*.js',
            './tests/starter_pack/**/*.js',
            './server.js'
          ]
        },
        jshintrc: './.jshintrc'
      }
    },

    /**
     * uglify: compress code while preserving key identifiers
     */
    uglify: {
      options: {
        // banner: '<%= atomic_header %>\n',
        mangle: {
          except: ['require', 'define', 'Fiber', 'undefined']
        }
      },
      atomic: {
        files: {
          './tmp/atomic.min.js': [ './tmp/atomic.js' ]
        }
      }
    },

    /**
     * includereplace: replace segments of a file with contents of another
     */
    includereplace: {
      atomic: {
        options: {
          globals: {
            ATOMIC_VERSION: '<%=atomic_version %>'
          },
          prefix: '\/\/@@',
          suffix: ''
        },
        src: './src/atomic.js',
        dest: './tmp'
      }
    },

    /**
     * express: runs our server for examples
     */
    express: {
      server: {
        options: {
          port: 4000,
          debug: true,
          server: path.resolve('./server.js')
        }
      },
      quiet: {
        options: {
          port: 4000,
          debug: false,
          server: path.resolve('./server.js')
        }
      }
    },

    wait: {
      server: {
        options: {
          delay: 3
        }
      }
    },

    compress: {
      release: {
        options: {
          archive: './dist/<%= zip_locations.archive %>',
          pretty: true
        },
        files: [
          {
            src: '**',
            dest: '/',
            expand: true,
            filter: 'isFile',
            cwd: 'dist/<%= zip_locations.path %>/'
          }
        ]
      }
    }
  });

  // load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-include-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-bower-task');

  // from https://github.com/gruntjs/grunt/issues/236
  grunt.registerMultiTask('wait', 'Wait for a set amount of time.', function () {
    var delay = this.data.options.delay;
    var d = delay ? delay + ' second' + (delay === '1' ? '' : 's') : 'forever';

    grunt.log.write('Waiting ' + d + '...');

    // Make this task asynchronous. Grunt will not continue processing
    // subsequent tasks until done() is called.
    var done = this.async();

    // If a delay was specified, call done() after that many seconds.
    if (delay) { setTimeout(done, delay * 1000); }
  });

  grunt.registerTask('build', [
    'bower:install',
    'copy:fiber', // fiber is in NPM, not bower, so copy it over
    'jshint',
    'shell:tag',
    'includereplace:atomic',
    'uglify:atomic',
    'copy:atomic',
    'copy:text',
    'copy:starterPack',
    'copy:compat',
    'clean:tmp'
  ]);

  // Venus is commented out for now until it has
  // access to hot reload and cleanly scans files
  grunt.registerTask('test', [
    'build',
    'bower:install',
    'shell:venus',
    'clean:tmp'
  ]);

  grunt.registerTask('itest', [
    'build',
    'bower:install',
    'shell:venus_browser'
  ]);

  grunt.registerTask('server', [
    'express:server',
    'express-keepalive'
  ]);

  grunt.registerTask('release', [
    'build',
    'compress:release'
  ]);

  grunt.registerTask('default', ['build']);
};
