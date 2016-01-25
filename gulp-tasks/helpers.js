var helpers = {

    /**
     * Gets a string that contains the current time.
     * @returns {string}
     */
    getTimeString: function getTimeString() {
        var time = new Date();

        return "[\x1b[90m" +
            ("0" + time.getHours()).slice(-2) + ":" +
            ("0" + time.getMinutes()).slice(-2) + ":" +
            ("0" + time.getSeconds()).slice(-2) +
            "\x1b[0m]";
    }
};

module.exports = helpers;