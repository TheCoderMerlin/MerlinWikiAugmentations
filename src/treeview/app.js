import $ from 'jquery';
const jQuery = $;
import Str from '../str';

class Treeview {
    /**
     * Inject the styles
     *
     * @return {undefined}
     */
    static styles() {
        const id = "merlin-treeview-styles";

        if ($("#".id).length > 0) {
            console.log('Styles found');

            return;
        }

        $("head").append(`
        <style id="${id}">
        :root {
            --merlin-color: #4c3484;
        }
        
        .merlin-treeview-title, .merlin-treeview-leaf {
            cursor: pointer;
            user-select: none;
        }

        .merlin-treeview-list {
            padding-left: 0.5rem;
        }

        .merlin-treeview-list li {
            list-style-type: none;
        }

        .merlin-treeview-list li::before {
            display: inline-block;
            content: "\\00D7";
            font-size: 1.25em;

            transform: rotate(-45deg);

            transition-property: transform;
            transition-duration: 0.2s;
            transform-origin: center;
        }

        .merlin-treeview-list li.open::before {
            transform: rotate(0deg);
        }

        .merlin-treeview-list .merlin-treeview-leaf::before, .merlin-treeview-list .merlin-treeview-leaf.open::before {
            content: "/ ";
            transform: rotate(0deg);
        }

        .merlin-treeview-list .merlin-treeview
        -leaf {
            color: blue;
        }
        
        .merlin-spinner {
            height: 10em;
            width: 10em;
            border-color: var(--merlin-color);
            border-right-color: transparent;
            border-left-color: transparent;
            border-width: 0.5em;
            display: block;
            animation: .75s cubic-bezier(0.22, 0.61, 0.36, 1) infinite spinner-border;
        }
    </style>
    `);
    }

    /**
     * Build a treeview
     *
     * @param  {jQuery|string} $elem The wrapper jQuery element or selector
     * @param  {object} data The data to display on the treeview
     * @param  {function} callback The callback when a final child is selected
     * @param  {number} level The level of recursion
     * @return {undefined}
     */
    static render($elem, data, callback = () => {}, level = 0) {
        if (level === 0) {
            Treeview.styles();
        }

        // Convert $elem to a jQuery object is given a string selector
        if (typeof $elem === 'string') {
            $elem = $($elem);
        }

        let $ul = $(`<ul class="merlin-treeview-list"></ul>`);

        // Hide if past the second level
        if (level > 1) {
            $ul.hide();
        }

        // Guess the rows
        let rows = Treeview.getChildRows(data);

        if (rows && rows.length > 0) {
            for (let key in rows) {
                let row = rows[key];

                // If we're on a leaf, render it and skip the rest of the loop
                if ((Treeview.getChildRows(row) || []).length === 0) {
                    let $li = $(`<li class="merlin-treeview-leaf">&nbsp;${row.name}</li>`);
                    $li.data("row", row);

                    $li.click(callback);

                    $ul.append($li);

                    continue;
                }

                const name = row.pathname;

                let $title = $(`<span class="merlin-treeview-title">&nbsp;${name}</span>`);
                $title.data("row", row);

                let $li = $(`<li></li>`);

                $li.click(callback);

                // The li of the first level is open
                if (level === 0) {
                    $li.addClass('open');
                }

                $li.append($title);

                $title.click(function () {
                    // Get the child list
                    let $ul = $title.siblings('ul:first');

                    // Check the visibility of the list
                    const visible = $ul.is(':visible');

                    if (visible) {
                        $ul.slideUp('fast');
                        $li.removeClass('open');
                    } else {
                        $ul.slideDown('fast');
                        $li.addClass('open');
                    }
                });

                $ul.append($li);

                Treeview.render($li, row, callback, level + 1);
            }
        }

        $elem.append($ul);
    }

    /**
     * Figure out the children rows element
     *
     * @param  {object} row
     * @return {Array<object>}
     */
    static getChildRows(row) {
        if (!row.hasOwnProperty("children")) {
            return null;
        }

        if (row.children.hasOwnProperty("rows")){
            return row.children.rows;
        }

        return row.children;
    }
}

export default Treeview;