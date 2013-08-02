module.exports = function(grunt){
	var
        onfAmd,
        onfAdd,

		buildJSON
	;

	onfAmd = {
		name    : "dances.amd",
		srcPath : "src/",
		destPath: "dist/"
	};

	onfAdd = {
		name    : "dances.add",
		srcPath : "src/",
		destPath: "dist/"
	};

	buildJSON = grunt.file.readJSON("build.json");

	grunt.initConfig({
		pkg      : grunt.file.readJSON("package.json"),

		concat   : {
			generic: {
				options: {
					banner: '/* <%= pkg.name %> - v<%= pkg.version %> - ' +
					        '<%= grunt.template.today("yyyy-mm-dd") %> */' +
							'\n'
				},
				expand : true,
				cwd    : onfAmd.srcPath,
				src    : buildJSON.Amd,
				rename : function(){
					return onfAmd.destPath + onfAmd.name + ".js";
				}
			},
			
			add: {
				options: {
					banner: '/* ' + onfAdd.name + ' - v<%= pkg.version %> - ' +
					        '<%= grunt.template.today("yyyy-mm-dd") %> */' +
							'\n'
				},
				expand : true,
				cwd    : onfAdd.srcPath,
				src    : buildJSON.Add,
				rename : function(){
					return onfAdd.destPath + onfAdd.name + ".js";
				}
			}
		},

		uglify   : {
			generic: {
				expand : true,
				options: {
					banner   : '/* <%= pkg.name %> - v<%= pkg.version %> - ' +
					           '<%= grunt.template.today("yyyy-mm-dd, h:MM:ss TT") %> */' +
					           '\n',
					report   : "gzip",
					sourceMap: onfAmd.destPath + onfAmd.name + "-map.js"
				},
				src    : onfAmd.destPath + onfAmd.name + ".js",
				ext    : (onfAmd.name.slice(onfAmd.name.indexOf(".")) + ".min.js")
			},
			add: {
				expand : true,
				options: {
					banner   : '/* <%= pkg.name %> - v<%= pkg.version %> - ' +
					           '<%= grunt.template.today("yyyy-mm-dd, h:MM:ss TT") %> */' +
					           '\n',
					report   : "gzip",
					sourceMap: onfAdd.destPath + onfAdd.name + "-map.js"
				},
				src    : onfAdd.destPath + onfAdd.name + ".js",
				ext    : (onfAdd.name.slice(onfAdd.name.indexOf(".")) + ".min.js")
			}
		},

		clean: {
			def: {
				src: "dist/"
			}
		}

	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-clean");
	grunt.loadNpmTasks("grunt-contrib-uglify");

	grunt.registerTask("default", []);
	grunt.registerTask("add", ["concat:add", "uglify:add"]);

};