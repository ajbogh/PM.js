var webserver = require('gulp-webserver');

module.exports = function (gulp) {
    return function () {
        gulp.src('./sample')
            .pipe(webserver({
                host: "pmmain.local",
                livereload: {enable: true, port: 35729},
                directoryListing: false,
                fallback: "./sample/index.html",
                open: false,
                port: 8888,
                proxies: [{
                    source: "/build",
                    target: "http://pmmain.local:8890"
                }]
            }));

        gulp.src('./sample/otherdomain')
            .pipe(webserver({
                host: "pminner.local",
                livereload: false, //the livereload above takes care of this.
                directoryListing: false,
                fallback: "./sample/otherdomain/index.html",
                open: false,
                port: 8889,
                proxies: [{
                    source: "/build",
                    target: "http://pmmain.local:8890"
                }]
            }));

        gulp.src('./build')
            .pipe(webserver({
                host: "pmmain.local",
                livereload: {enable: true, port: 35730},
                directoryListing: false,
                open: false,
                port: 8890
            }));
    };
};