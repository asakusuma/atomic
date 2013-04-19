// gruntfile.js
// var path = require('path');

module.exports = function (grunt) {

  grunt.initConfig({
    output_files: {
      main:         './dist/atomic-__ATOMIC__VERSION__/atomic.js',
      main_min:     './dist/atomic-__ATOMIC__VERSION__/atomic.min.js',
      license:      './dist/atomic-__ATOMIC__VERSION__/LICENSE',
      readme:       './dist/atomic-__ATOMIC__VERSION__/README.md'
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
            './src/*.js'
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
    }
  });

  // load NPM tasks
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-include-replace');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  // grunt.loadNpmTasks('grunt-contrib-compress');
  // grunt.loadNpmTasks('grunt-contrib-concat');
  // grunt.loadNpmTasks('grunt-contrib-qunit');
  // grunt.loadNpmTasks('grunt-express');

  grunt.registerTask('build', [
    'jshint',
    'shell:tag',
    'includereplace:atomic',
    'uglify:atomic',
    'copy:atomic',
    'copy:text',
    // copy:config.js (TODO: jchan)
    'clean:tmp'
  ]);

  // TODO: jchan (venus launcher)

  // grunt.registerTask('test', []);
  // grunt.registerTask('release', []);

  grunt.registerTask('default', ['build']);
};