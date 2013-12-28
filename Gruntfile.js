module.exports = function(grunt) {

    require('load-grunt-tasks')(grunt, {
        scope: ['dependencies', 'devDependencies']
    });

    grunt.initConfig({
        express: {
            dev: {
                options: {
                    script: 'demo/server.js'
                }
            }
        },
        open: {
            dev: {
                path: 'http://127.0.0.1:3000'
            }
        },
        watch: {
            express: {
                files: [
                    './src/**/*.js',
                    './demo/**/*.js'
                ],
                options: {
                    spawn: false,
                    livereload: true
                }
            },
        },
        karma: {
            plugins: [
                'karma-osx-reporter'
            ],
            unit: {
                configFile: 'karma-unit.conf.js',
                autoWatch: false,
                singleRun: true
            },
            unitAuto: {
                configFile: 'karma-unit.conf.js',
                autoWatch: true,
                singleRun: false
            }
        },
        jshint: {
            all: ['src/*.js']
        }
    });

    // server with live reload
    // @note server doesn't currently 
    // restart express as it should. this has been disabled 
    grunt.registerTask('server', [
        'express:dev',
        'open:dev',
        'watch'
    ]);

    // run unit tests 1 time
    grunt.registerTask('test:unit', [
        'karma:unit'
    ]);

    // autotest
    grunt.registerTask('autotest', [
        'karma:unitAuto'
    ]);

    // default is to lint
    // @todo add min, build
    grunt.registerTask('default', [
        'jshint'
    ]);

};
