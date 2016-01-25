var gulp = require('gulp');

//import tasks
gulp.task('jshint', require('./gulp-tasks/build').jshint(gulp));
gulp.task('copy', ['jshint'], require('./gulp-tasks/build').copy(gulp));
gulp.task('min', ['jshint'], require('./gulp-tasks/build').minify(gulp));
gulp.task('build', ['jshint', 'copy', 'min'], require('./gulp-tasks/build').build(gulp));
gulp.task('serve', ['build'], require('./gulp-tasks/serve')(gulp));

gulp.task('watch', ['serve'], require('./gulp-tasks/watch').watch(gulp));
