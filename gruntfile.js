// gruntfile.js
var path = require('path');

module.exports = function (grunt) {

  grunt.initConfig({
    output_files: {
      main:         './dist/atomic-__ATOMIC__VERSION__/atomic.js',
      main_min:     './dist/atomic-__ATOMIC__VERSION__/atomic.min.js',
      config:       './dist/atomic-__ATOMIC__VERSION__/config.js',
      license:      './dist/atomic-__ATOMIC__VERSION__/LICENSE',
      readme:       './dist/atomic-__ATOMIC__VERSION__/README.md',
      starterPack:  './dist/atomic-__ATOMIC__VERSION__/starter_pack/'
    },
    anonymous_header: '!(function(context, undefined){\n',
    anonymous_footer: '\n;context.Atomic.version = "__ATOMIC__VERSION__";\n})(this);',
    pkg: grunt.file.readJSON('package.json'),

    /**
     * clean: clean up temp and artifact directories
     */
    clean: {
      tmp: ['./tmp'],
      dist: ['./dist']
    },

    /**
     * shell: run shell commands. We use this for git ops
     */
    shell: {
      tag: {
        command: 'git describe HEAD',
        options: {
          callback: function (err, stdout, stderr, next) {
            var foot = grunt.config.get('anonymous_footer');
            var output_files = grunt.config.get('output_files');
            var version = stdout.replace(/[\s]/g, '');
            var file;
            var type;

            function addVersion(str) {
              return str.replace(/__ATOMIC__VERSION__/g, version);
            }

            // set the atomic version everywhere we need to
            grunt.config.set('anonymous_footer', addVersion(foot));
            for (type in output_files) {
              file = grunt.config.get('output_files.'+type);
              grunt.config.set('output_files.'+type, addVersion(file));
            }

            next();
          }
        }
      },
      venus: {
        command: ['if [ -e node_modules/venus/bin/venus ] && command -v phantomjs >/dev/null;',
                  'then node node_modules/venus/bin/venus run -t "tests/spec" -n;',
                  'else echo "cant find venus in node_modules and/or cant find phantomJS. ',
                             'Run npm install and run npm install -g phantomjs";',
                  'fi'].join(' '),
        options: {
          stdout: true
        }

      },
      venus_browser: {
        command: ['if [ -e node_modules/venus/bin/venus ];',
                  'then node node_modules/venus/bin/venus run -t "tests/spec";',
                  'else echo "cant find venus in node_modules. Run npm install";',
                  'fi'].join(' '),
        options: {
          stdout: true
        }
      }
    },

    /**
     * copy: copy files that need no modification
     */
    copy: {
      atomic: {
        files: [
          {src: './tmp/atomic.js', dest: '<%=output_files.main %>', filter: 'isFile'},
          {src: './tmp/atomic.min.js', dest: '<%=output_files.main_min %>', filter: 'isFile'}
        ]
      },
      text: {
        files: [
          {src: ['./LICENSE'], dest: '<%= output_files.license %>', filter: 'isFile'},
          {src: ['./README.md'], dest: '<%= output_files.readme %>', filter: 'isFile'}
        ]
      },
      config: {
        files: [
          {src: ['./src/config/config.js'], dest: '<%= output_files.config %>', filter: 'isFile'}
        ]
      },
      starterPack: {
        files: [
          {expand: true, cwd: './starter_pack/', src: ['**'], dest: '<%= output_files.starterPack %>'}
        ]
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
            './src/atomic/*.js',
            './src/compat/*.js',
            './src/customizable/*.js',
            './starter_pack/**/*.js',
            './src/*.js',
            './tests/spec/**/*.js',
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
          prefix: '//@@',
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
      example: {
        options: {
          port: 4000,
          debug: true,
          server: path.resolve('./server.js')
        }
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
  // grunt.loadNpmTasks('grunt-contrib-compress');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.loadNpmTasks('grunt-contrib-qunit');

  grunt.registerTask('build', [
    'jshint',
    'shell:tag',
    'includereplace:atomic',
    'uglify:atomic',
    'copy:atomic',
    'copy:text',
    'copy:config',
    'copy:starterPack',
    'clean:tmp'
  ]);

  // Using Venus via a shell command for now
  // requires npm install -g phantomjs
  grunt.registerTask('test', [
    'shell:venus'
  ]);

  grunt.registerTask('server', [
    'express:example',
    'express-keepalive'
  ]);
  // grunt.registerTask('release', []);

  grunt.registerTask('default', ['build']);
};
