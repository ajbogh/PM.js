# grunt-jasmine-coverage

Grunt task for running jasmine specs via phantomjs, and able to generate code coverage report.

**NOTE This plugin is compatible with grunt 0.3, but not grunt 0.4 !!!**

## Getting Started

Install this grunt plugin next to your project's "grunt.js" or "Gruntfile", start with: `npm install grunt-jasmine-coverage`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-jasmine-coverage');
```

## Config
- jasmine
  - src : Your source files to test, loaded first
  - helpers : Any helpers files to aid in testing, loaded next
  - specs : Spec files that contain your jasmine tests
  - amd: If true the spec files will be loaded via an AMD `require` call.
  - timeout : The timeout where the tests are abandoned
  - template : Path to a custom template.
  - server :
     - port : The port to start the server on, defaults to 8888
  - junit :
     - output : The output directory for junit xml
  - phantomjs : A hash of options to pass to phantomjs eg {'ignore-ssl-errors' : true}
  - coverage :
     - output : The output directory for coverage report
     - reportType : Could be `lcov` or `cobertura`. Default is `lcov`.
     - excludes : Any files to be excluded from instrumenting.

- jasmine-server
  - browser : Open user's default browser automatically? Default true

( all `jasmine` task configuration applies to `jasmine-server`, but only `coverage` will be ignored. )

```javascript
'jasmine' : {
  src : 'src/**/*.js',
  specs : 'specs/**/*Spec.js',
  helpers : 'specs/helpers/*.js',
  timeout : 10000,
  template : 'src/custom.tmpl',
  junit : {
    output : 'junit/'
  },
  coverage : {
    output : 'junit/coverage/',
    reportType : 'cobertura',
    excludes : ['lib/**/*.js']    
  },
  phantomjs : {
    'ignore-ssl-errors' : true
  }
},
'jasmine-server' : {
  browser : false
}
```

## AMD Specs

If the `amd` flag is set in the config specs will be loaded via an AMD `require` call.  This does not make an assumption about the AMD library being used, you must specify the path to that in the helpers option e.g.

```javascript
helpers: [
  '/path/to/require.js',
  '/path/to/requireConfig.js'
],
```

Spec files should define the module(s) they are testing directly as the `src` config option will be ignored in this case e.g.

```javascript
define(['/src/myModule.js'], function(MyModule){
  describe('MyModule', function(){
    // etc...
  });
});
```

## PhantomJS

The base jasmine task requires phantomjs to be installed and in the executable path. Download [phantomjs here](http://phantomjs.org/)

## Running

After successful configuration, you can run your tests through phantomjs with :

```grunt jasmine```

Or run your tests through phantomjs and generate code coverage report with :

```grunt jasmine-coverage```

Or open in a web browser with

```grunt jasmine-server```

## Example configuration

Here is an [example grunt jasmine configuration](https://github.com/jsoverson/grunt-jasmine-runner-example) based off the
 Pivotal Labs example app.


## License
Licensed under the MIT license.

Portions adapted from grunt core tasks and are copyright Ben Alman and licensed under the MIT license

Forked from https://github.com/creynders/grunt-jasmine-runner by Jarrod Overson. And incorprates https://github.com/taichi/grunt-istanbul
