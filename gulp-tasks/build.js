//jshint
var jshint = require('gulp-jshint');
var notify = require('gulp-notify');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');

module.exports = {
    jshint: function (gulp) {
        return function () {
            return gulp.src('./src/*.js')
                .pipe(jshint('.jshintrc'))
                .pipe(jshint.reporter('jshint-stylish'))
                .pipe(jshint.reporter('fail'))
                .pipe(notify({
                    title: 'JSHint',
                    message: 'JSHint Passed.',
                }));
        };
    },

    //copy to build
    copy: function(gulp){
        return function () {
            return gulp.src('./src/*.js')
                .pipe(gulp.dest('./build'));
        }
    },

    //minify to build
    minify: function(gulp){
        return function () {
            return gulp.src('./src/*.js')
                .pipe(uglify({
                    mangle: true
                }))
                .pipe(rename({
                    suffix: ".min"
                }))
                .pipe(gulp.dest('./build'));
        }
    },

    build: function(gulp){
        return function (){
            gulp.task('build', function () {
                console.log("Build done!");
            });
        };
    }
};