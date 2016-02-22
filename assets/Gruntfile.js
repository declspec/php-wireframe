module.exports = function(grunt) {
    var jsDestination = "../public/js/<%= pkg.version %>/",
        cssDestination = "../public/css/<%= pkg.version %>/";
    
    var config = {
        pkg: grunt.file.readJSON("package.json"),
        clean: {
            js: [ jsDestination ],
            css: [ cssDestination ],
            options: { force: true }
        },
        cssmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: cssDestination,
                    src: [ "*.css" ],
                    dest: cssDestination,
                    ext: ".css"
                }]
            }
        },
        sass: {
            dist: {
                files: [{
                    expand: true,
                    flatten: true,
                    cwd: "sass",
                    src: [ "*/*.scss" ],
                    dest: cssDestination,
                    ext: ".css"
                }]
            }
        },
        watch: {
            js: {
                files: "js/**/*.js",
                tasks: "dev-js",
                options: { spawn: false }
            },
            sass: {
                files: "sass/**/*.scss",
                tasks: "dev-css",
                options: { spawn: false }
            }
        }
    };
    
    grunt.config.init(config);
    
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-sass");
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    
    grunt.registerTask("config-js", function() {
        config.concat = config.concat || {};
        config.uglify = config.uglify || {};
        
        var expandOpts = {
            cwd: "./js",
            filter: "isDirectory"
        };
        
        // Each directory represents a compilable module.
        grunt.file.expand(expandOpts, "*").forEach(function(dir) {
            var moduleName = dir.toLowerCase(),
                outputFile = jsDestination + moduleName + ".js";
            
            // Configure concat/uglify in the same way, only one is used.
            config.concat[moduleName] = config.uglify[moduleName] = {
                src: [ "./js/" + dir + "/**/*.js" ],
                dest: outputFile
            };
        });
    });
    
    grunt.registerTask("dev-js", [ "config-js", "concat" ]);
    grunt.registerTask("dev-css", [ "sass" ]);
    grunt.registerTask("dev", [ "clean", "dev-css", "dev-js" ]);
    grunt.registerTask("prod", [ "clean", "sass", "config-js", "uglify", "cssmin" ]);
    
    grunt.registerTask("default", [ "dev" ]);
};