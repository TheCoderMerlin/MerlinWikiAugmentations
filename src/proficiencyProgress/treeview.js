import {Http, apiBaseUrl} from '../http';
import $ from 'jquery';
import Treeview from '../treeview/app';

require('@selectize/selectize/dist/js/standalone/selectize.min');
require('@selectize/selectize/dist/css/selectize.bootstrap4.css');

/**
 * Disables a button
 *
 * @param  {boolean} disable
 * @return {jQuery}
 */
$.fn.disable = function (disable = true) {
    if (disable) {
        $(this).attr("disabled", "disabled");
    } else {
        $(this).removeAttr("disabled");
    }
};

/**
 * Simple error handler
 *
 * @param  {string|object} error
 * @return {undefined}
 */
function error(error) {
    $("body").html(`<h1 class="text-center text-danger heading-1">Error. Please try reloading this page.</h1>`);

    // Rethrow
    // This function just shows the user a message
    throw error;
}

/**
 * @property {string} username The current username
 * @property {string} sessionId The current sessionId
 * @property {jQuery} $dropdown The student selection dropdown
 * @property {jQuery} $spinner The general spinner
 * @property {jQuery} $tableSpinner The table spinner
 * @property {jQuery} $table The table
 * @property {?string} pathname The active pathname
 * @property {?jQuery} $user The currently selected user DOM element
 * @property {?Selectize} selectize The selectize element
 * @property {?jQuery} $btns The button wrapper
 */
class UsersTreeview extends Treeview {
    /**
     * Display the treeview
     *
     * @param  {string} username
     * @param  {string} sessionId
     * @return {Promise<Object>}
     */
    static async build(username, sessionId) {
        // Register button callbacks
        this.$btns = $(".dropdown-control-buttons");

        this.$btns.find("#prev-button").click(() => this.prev.apply(this));
        this.$btns.find("#next-button").click(() => this.next.apply(this));

        this.$btns.hide();

        // Set context
        this.username = username;
        this.sessionId = sessionId;

        // Minimize DOM lookups
        this.$spinner = $("#treeview-spinner");
        this.$table = $("table#mastery-progress-table");
        this.$dropdown = $("#students-dropdown");

        // Initialize
        let data = {};

        try {
            data = await Http.get(`${apiBaseUrl}/groups/underAuthority/${username}`, {}, {
                "username": username,
                "sessionId": sessionId
            });
        } catch (e) {
            error(e);
            return;
        }

        // Wrap in a root element
        data = {
            children: {
                rows: [
                    {
                        pathname: "Root",
                        children: data
                    }
                ]
            }
        };

        // Hide the table and dropdown by default
        this.$table.hide();

        // Hide the spinner
        this.$tableSpinner = $("#mastery-loader");
        this.$tableSpinner.hide();

        // Set the default pathname
        this.pathname = null;

        this.render($("#users-treeview"), data, (event) => this.callback.apply(this, [event]));

        // Add an event handler for the dropdown
        this.$dropdown.on("change", () => this.dropdownChange.apply(this));
    }

    /**
     * Treeview callback
     *
     * @param  {Event} event
     * @return {Promise<void>}
     */
    static async callback(event) {
        // Get the target from the event
        const $target = $(event.target);

        // Extract the row data from the data-row attribute
        const row = $target.data("row");

        // If row is undefined, do nothing
        if (!row) {
            console.log("No data, so doing nothing.");

            return;
        }

        // Detect the fake "AHS" root element
        if (!row.parentId) {
            console.log("Fake branch detected.");

            return;
        }

        // Show the loader
        this.$dropdown.hide();
        this.$spinner.show();
        this.$dropdown.empty();
        //$table.find("tbody").empty();
        this.$table.hide();
        this.$btns.hide();

        let $default = $(`<option disabled selected value="">Select a student</option>`);
        this.$dropdown.append($default);

        this.pathname = row.pathname;

        // Ignore if the active pathname is already set
        if (this.$dropdown.data("activePathname") == this.pathname) {
            return;
        }

        // Mark the active path in the dropdown
        this.$dropdown.data("activePathname", this.pathname);

        let rows = [];

        try {
            rows = await Http.get(apiBaseUrl + `/groups/underAuthority/${this.username}/${row.pathname}/users`, {}, {
                username: this.username,
                sessionId: this.sessionId
            });
        } catch (e) {
            error(e);
        }

        // Update the count if not already
        if (!$target.data("count")) {
            $target.data("count", rows.length);

            $target.text($target.text() + ` (${$target.data("count")})`);
        }

        // Sort by last name
        rows.sort((a, b) => (a.lastName > b.lastName) ? 1 : -1);

        let options = [];

        for (let i = 0; i < rows.length; i++) {
            let user = rows[i];

            options.push({
                value: user.userName,
                label: `${user.lastName}, ${user.firstName} (${user.userName})`,
                user: user,
            });
        }

        // Re-initialize
        const $col = $("#treeview-spinner").parent(".col.d-flex");

        //this.$dropdown = this.$dropdown.clone(true, true);

        //$col.find(".selectize-control, .selectized").remove();

        //$col.prepend(this.$dropdown);

        // Re-init
        if (!this.selectize) {
            this.selectize = this.$dropdown.selectize({
                render: {
                    /**
                     * Custom render function
                     *
                     * @param  {object} data
                     * @param  {function} escape
                     * @return {string}
                     */
                    option: function (data, escape) {
                        return `<div class="option" data-user='${JSON.stringify(data.user)}' data-value="${data.value}">${data.label}</div>`;
                    },
                },
                valueField: "value",
                labelField: "label",
                searchField: "label",
            })[0].selectize;
        }

        console.log(this.selectize);

        // Update the available options
        this.selectize.clearOptions(true);
        this.selectize.addOption(options);
        this.selectize.refreshOptions(false);

        // Reset $user
        this.$user = null;

        this.$spinner.hide();
        this.$btns.css("display", "flex");
        //$dropdown.show();
    }

    /**
     * Handle a dropdown update
     *
     * @return {Promise<void>}
     */
    static async dropdownChange() {
        this.disable(true);

        // Find $thead
        let $thead = this.$table.find("thead");

        // Hide the table again
        let height = this.$table.height();
        this.$table.hide();
        this.$tableSpinner.height(height).css("display", "flex");

        // Remove the first header row if more than one exists
        if ($thead.find("tr").length > 1) {
            $thead.find("tr:not(:last-child)").remove();
        }

        const selectedUsername = this.$dropdown.val();

        // Show the user's name on top of the table
        this.$user = this.selectize.getOption(selectedUsername);
        const user = this.$user.data("user");

        // Get the previous user
        console.log(this.$user.prev(), this.$user.next());

        // Wait for the table to generate
        try {
            await window.merlinProficiencyProgress(this.username, this.sessionId, selectedUsername, this.pathname);
        } catch (e) {
            error(e);
        }

        // Prepend the student's name to the table header
        this.$table.find("thead").prepend(`
<tr>
    <th colspan="7">
        <h2 class="text-center">${user.lastName}, ${user.firstName}</h2>
    </th>
</tr>
`);

        // Hide the spinner and show the table
        this.$tableSpinner.hide();
        this.$table.show();
        this.disable(false);
    }

    /**
     * Update the current student
     *
     * @param  {?jQuery} $newUser
     */
    static updateUser($newUser) {
        // Guard
        if (!$newUser) {
            console.log("Undefined user!");
            return;
        }

        console.log($newUser);

        //this.selectize.setActiveOption($newUser, false, false);

        $newUser.trigger("mousedown");

        // Update the currently selected user
        //this.$user = $newUser;
    }

    /**
     * Select the previous student
     *
     * @return {Promise<void>}
     */
    static prev() {
        this.updateUser(this.$user.prev());
    }

    /**
     * Select the next student
     *
     *
     * @return {Promise<void>}
     */
    static next() {
        this.updateUser(this.$user.next());
    }

    /**
     * Disable the buttons
     *
     * @param  {boolean} disable
     * @return {undefined}
     */
    static disable(disable = true) {
        if (disable) {
            this.$btns.find("button").disable(disable);
        } else {
            // Keep disabled if there's no element to change to
            if (!this.$user.next().length && !this.$user.prev().length) {
                // Keep both disabled
            } else if (!this.$user.next().length) {
                this.$btns.find("#prev-button").disable(false);
            } else if (!this.$user.prev().length) {
                this.$btns.find("#next-button").disable(false);
            } else {
                this.$btns.find("button").disable(false);
            }
        }
    }
}

export default UsersTreeview;