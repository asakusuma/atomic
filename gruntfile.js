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
  
  function setVersion(version) {
    var foot = grunt.config.get('anonymous_footer');
    var output_files = grunt.config.get('output_files');
    var zip_locations = grunt.config.get('zip_locations');
    var version_string = grunt.config.get('version_string');
    var file;
    var type;

    function addVersion(str) {
      return str.replace(/__ATOMIC__VERSION__/g, version);
    }

    // set the atomic version everywhere we need to
    grunt.config.set('anonymous_footer', addVersion(foot));
    grunt.config.set('version_string', addVersion(version_string));
    for (type in output_files) {
      file = grunt.config.get('output_files.'+type);
      grunt.config.set('output_files.'+type, addVersion(file));
    }
    for (type in zip_locations) {
      file = grunt.config.get('zip_locations.'+type);
      grunt.config.set('zip_locations.'+type, addVersion(file));
    }
  }

  grunt.initConfig({
    output_files: {
      main:         './dist/recent/atomic.js',
      main_min:     './dist/recent/atomic.min.js',
      license:      './dist/recent/LICENSE',
      readme:       './dist/recent/README.md',
      starterPack:  './dist/recent/starter_pack/',
      compat:       './dist/recent/compat/',
      release:      'dist/atomic-__ATOMIC__VERSION__/'
    },
    zip_locations: {
      archive:      'atomic-__ATOMIC__VERSION__.tgz',
      path:         'atomic-__ATOMIC__VERSION__'
    },
    version_string: '__ATOMIC__VERSION__',
    anonymous_header: '!(function(context, undefined){\n',
    anonymous_footer: '\n;context.Atomic.version = "__ATOMIC__VERSION__";\n})(this);',

    /**
     * clean: clean up temp and artifact directories
     */
    clean: {
      tmp: ['./tmp'],
      dist: ['./dist/atomic-*']
    },

    /**
     * shell: run shell commands. We use this for git ops
     */
    shell: {
      versionFromTag: {
        command: 'git describe HEAD',
        options: {
          callback: function (err, stdout, stderr, next) {
            var version = stdout.replace(/[\s]/g, '');
            setVersion(version);
            next();
          }
        }
      },
      git_add: {
        command: 'git add -A',
        options: {
          callback: function(err, stdout, stderr, next) {
            next();
          }
        }
      },
      git_commit_release: {
        command: 'git commit -m "chore(*): Release of Atomic <%= version_string %> (via grunt)"',
        options: {
          callback: function(err, stdout, stderr, next) {
            next();
          }
        }
      },
      git_tag_release: {
        command: 'git tag -a <%= version_string %> -m "Release <%= version_string %> (via grunt)"',
        options: {
          callback: function(err, stdout, stderr, next) {
            next();
          }
        }
      },
      venus_automated: {
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
      fiber_to_tmp: {
        files: [
          {src: ['./node_modules/fiber/src/fiber.js'], dest: './tmp/lib/fiber/fiber.js', filter: 'isFile'}
        ]
      },
      semver_to_tmp: {
        files: [
          {src: ['./node_modules/semver/semver.js'], dest: './tmp/lib/semver/semver.js', filter: 'isFile'}
        ]
      },
      atomic_to_uglify: {
        files: {
          // dest: src
          './tmp/uglify.in': './tmp/atomic.js'
        }
      },
      atomic_to_final: {
        files: {'./tmp/final.out': './tmp/atomic.js'}
      },
      uglify_to_final: {
        files: {'./tmp/final.out': './tmp/uglify.out'}
      },
      concat_to_final: {
        files: {'./tmp/final.out': './tmp/concat.out'}
      },
      final_to_main: {
        files: [{src: './tmp/final.out', dest: '<%= output_files.main %>', filter: 'isFile'}]
      },
      final_to_main_min: {
        files: [{src: './tmp/final.out', dest: '<%= output_files.main_min %>', filter: 'isFile'}]
      },
      legal_to_legal: {
        files:[
          {src: ['./LICENSE'], dest: '<%= output_files.license %>', filter: 'isFile'},
          {src: ['./README.md'], dest: '<%= output_files.readme %>', filter: 'isFile'}
        ]
      },
      starterpack_to_starterpack: {
        files: [{expand: true, cwd: './starter_pack/', src: ['**'], dest: '<%= output_files.starterPack %>'}]
      },
      compat_to_compat: {
        files: [{expand: true, cwd: './src/compat/', src: ['**'], dest: '<%= output_files.compat %>'}]
      },
      recent_to_release: {
        expand: true,
        cwd: 'dist/recent',
        src: '*',
        dest: '<%= output_files.release %>'
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
        mangle: {
          except: ['require', 'define', 'Fiber', 'undefined']
        }
      },
      file: {
        files: {
          // output: from input
          './tmp/uglify.out': './tmp/uglify.in'
        }
      }
    },

    /**
     * includes: replace segments of a file with contents of another
     */
    includes: {
      atomic: {
        src: './src/atomic.js',
        dest: './tmp/atomic.js',
        options: {
          includeRegexp: /^(\s*)\/\/@@include\s*\(["'](\S+)["']\)\s*$/
        }
      }
    },
    
    /**
     * replaces strings (version)
     */
    'string-replace': {
      atomic: {
        files: {
          './tmp/atomic.js': './tmp/atomic.js'
        },
        options: {
          replacements: [{
            pattern: /@@ATOMIC_VERSION/g,
            replacement: '<%= version_string %>'
          }]
        }
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
      }
    },

    log: {
      release: {
        options: {
          message: [
            '',
            'Release is currently using <%= version_string %>',
            'to release as a specific version, use the --as=[version]',
            'flag.'
          ].join('\n')
        }
      },
      pushInstructions: {
        options: {
          message: [
            '',
            'A release has been made and auto-commited to your current branch. To',
            'push this release, please push this branch upstream, followed by',
            'pushing with the --tags flag.',
            '',
            'Release version: <%= version_string %>'
          ].join('\n')
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
    },
    
    changelog: {
      options: {
        github: 'jakobo/atomic',
        version: '<%= version_string %>'
      }
    },
    
    bumpup: {
      options: {
        dateformat: 'YYYY-MM-DD HH:mm'
      },
      setters: {
        version: function (old, releaseType, options) {
          return grunt.config.get('version_string');
        }
      },
      files: [
        'package.json',
        'bower.json'
      ]
    },

    versionFromParam: {},
    noop: {},
    autofail: {}
  });

  // load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-compress');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-string-replace');
  grunt.loadNpmTasks('grunt-express');
  grunt.loadNpmTasks('grunt-include-replace');
  grunt.loadNpmTasks('grunt-includes');
  grunt.loadNpmTasks('grunt-bower-task');
  grunt.loadNpmTasks('grunt-conventional-changelog');
  grunt.loadNpmTasks('grunt-bumpup');
  
  
  grunt.registerMultiTask('log', 'Print some messages', function() {
    grunt.log.writeln(this.data.options.message);
  });
  
  grunt.registerTask('versionFromParam', 'Use the version from a parameter --as', function() {
    setVersion(grunt.option('as'));
  });
  
  grunt.registerTask('noop', 'Does nothing', function() {});
  
  grunt.registerTask('autofail', 'Automatically stops a build', function() {
    throw new Error('Build halted');
  });

  // set up grunt task options
  grunt.registerTask('default', ['build']);
  
  grunt.registerTask('build', [
    'bower:install',
    'copy:fiber_to_tmp', // fiber is in NPM, not bower, so copy it over
    'copy:semver_to_tmp', // semver is in NPM, not bower
    'jshint',
    (grunt.option('as')) ? 'versionFromParam' : 'shell:versionFromTag',
    
    // create the atomic.js file
    'includes:atomic',
    'string-replace:atomic',
    'copy:atomic_to_final',
    'copy:final_to_main',
    'copy:atomic_to_uglify',
    'uglify:file',
    'copy:uglify_to_final',
    'copy:final_to_main_min',
    
    // copy the support files
    'copy:legal_to_legal',
    'copy:starterpack_to_starterpack',
    'copy:compat_to_compat',
    
    // clean up
    'clean:tmp'
  ]);
  
  grunt.registerTask('release', [
    'build',
    'copy:recent_to_release',
    'compress:release',
    'log:release',
    (grunt.option('as')) ? 'genlog' : 'noop',
    (grunt.option('as')) ? 'setversion' : 'noop',
    (grunt.option('as')) ? 'tagit' : 'noop'
  ]);
  
  grunt.registerTask('genlog', [
    (grunt.option('as')) ? 'versionFromParam' : 'noop',
    (grunt.option('as')) ? 'noop' : 'autofail',
    'changelog'
  ]);
  
  grunt.registerTask('setversion', [
    (grunt.option('as')) ? 'versionFromParam' : 'noop',
    (grunt.option('as')) ? 'noop' : 'autofail',
    'bumpup'
  ]);
  
  grunt.registerTask('tagit', [
    (grunt.option('as')) ? 'versionFromParam' : 'noop',
    (grunt.option('as')) ? 'noop' : 'autofail',
    'shell:git_add',
    'shell:git_commit_release',
    'shell:git_tag_release',
    'log:pushInstructions'
  ]);

  // Venus is commented out for now until it has
  // access to hot reload and cleanly scans files
  grunt.registerTask('test', [
    'build',
    'bower:install',
    'shell:venus_automated',
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
};
