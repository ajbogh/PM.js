var helpers = require('./helpers');

function onFileChange(event){
    if (!event) {
        return;
    }
    console.log(helpers.getTimeString(), "Change   '" + "\x1b[33m" + event.path + "\x1b[0m" + "'");
}

module.exports = {
    watch: function(gulp){
        //gulp.watch("sample/**/*").on('change', onFileChange);
        gulp.watch("./src/**/*", ['build']).on('change', onFileChange);
    }
}