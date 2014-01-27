module.exports = function(grunt) {
	grunt.initConfig({
	pkg: grunt.file.readJSON('package.json'),
	concat: {
	options: {
		separator: ';'
	},
	dist: {
		src: ['src/*.js'],
		dest: 'build/PM.js'
	}
	},
	min: {
	dist: {
		src: 'build/PM.js',
		dest: 'build/PM.min.js'
	}
	},
	jshint: {
	files: ['src/*.js', 'grunt.js'],
	options: {
		// options here to override JSHint defaults
		curly: true,
		eqeqeq: true,
		immed: true,
		latedef: true,
		newcap: true,
		noarg: true,
		sub: true,
		undef: false,
		boss: true,
		eqnull: true,
		browser: true,
		unused: false,
		supernew: true
	},
	globals: {
		require: true,
		define: true,
		requirejs: true,
		describe: true,
		expect: true,
		it: true,
		jQuery: true,
		console: true,
		module: true,
		document: true
	}
	},
	//watch: {
	//  files: ['<%= jshint.files %>'],
	//  tasks: ['jshint', 'qunit']
	//},

	/*cssmin: {
	'dist': {
	'src': 'css/stylesheet.css',
	'dest': 'css/stylesheet.min.css'
	}
	},*/

	//'jasmine' : {
	//	src : 'src/*.js',
	//	specs : 'tests/spec/*Spec.js',
	//	helpers : 'lib/jquery.min.js',
	//	timeout : 10000,
	//	junit : {
	//		output : 'tests/junit/'
	//	},
	//	coverage : {
	//		output : 'tests/junit/coverage/',
	//		reportType : 'cobertura',
	//		excludes : ['lib/**/*.js']
	//	},
	//	phantomjs : {
	//		'ignore-ssl-errors' : true
	//	},
	//	'jasmine-server' : {
	//		browser : false
	//	}
	//}
});

//grunt.loadNpmTasks('grunt-contrib-uglify');
grunt.loadNpmTasks('grunt-contrib-jshint');
//grunt.loadNpmTasks('grunt-contrib-qunit');
//grunt.loadNpmTasks('grunt-contrib-watch');
grunt.loadNpmTasks('grunt-contrib-concat');
grunt.loadNpmTasks('grunt-yui-compressor');
grunt.loadNpmTasks('grunt-contrib-qunit');
/*grunt.loadNpmTasks('grunt-jasmine-coverage');

//grunt.registerTask('test', ['jshint', 'qunit']);
grunt.registerTask('jasmine', ['jasmine']);*/

//grunt.registerTask('default', ['jshint', 'qunit', 'concat', 'uglify']);
grunt.registerTask('default', ['jshint', 'concat', 'min']);
};