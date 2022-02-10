class Str {
    /**
     * Convert a string to title case
     *
     * @param  {string} text
     * @return {string}
     */
    static title(text) {
        let split = text.split(' ');

        let title = '';

        for (let i = 0; i < split.length; i++) {
            let word = split[i];

            title += (function(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            })(word);

            if (i + 1 < split.length) {
                title += ' ';
            }
        }

        return title;
    }
}

export default Str;