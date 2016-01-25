var gulp = require('gulp');

//import tasks
gulp.task('serve', require('./gulp-tasks/serve')(gulp));
gulp.task('jshint', require('./gulp-tasks/build').jshint(gulp));
gulp.task('copy', ['jshint'], require('./gulp-tasks/build').copy(gulp));
gulp.task('min', ['jshint'], require('./gulp-tasks/build').minify(gulp));
gulp.task('build', ['jshint', 'copy', 'min'], require('./gulp-tasks/build').build(gulp));
