import {Http, apiBaseUrl} from '../http';
import $ from 'jquery';
import Treeview from '../treeview/app';

require('@selectize/selectize/dist/js/standalone/selectize.min');
require('@selectize/selectize/dist/css/selectize.bootstrap4.css');

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

class UsersTreeview extends Treeview {
    /**
     * Display the treeview
     *
     * @param  {string} username
     * @param  {string} sessionId
     * @return {Promise<Object>}
     */
    static async build(username, sessionId) {
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

        // Minimize DOM lookups
        let $dropdown = $("#students-dropdown");
        const $spinner = $("#treeview-spinner");
        const $table = $("table#mastery-progress-table");
        const $thead = $table.find("thead");

        // Hide the table and dropdown by default
        $table.hide();

        // Hide the spinner
        const $tableSpinner = $("#mastery-loader");
        $tableSpinner.hide();

        let pathname = null;

        UsersTreeview.render($("#users-treeview"), data, async function (event) {
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
            $dropdown.hide();
            $spinner.show();
            $dropdown.empty();
            //$table.find("tbody").empty();
            $table.hide();

            let $default = $(`<option disabled selected value="">Select a student</option>`);
            $dropdown.append($default);

            pathname = row.pathname;

            // Ignore if the active pathname is already set
            if ($dropdown.data("activePathname") == pathname) {
                return;
            }

            // Mark the active path in the dropdown
            $dropdown.data("activePathname", pathname);

            let rows = [];

            try {
                rows = await Http.get(apiBaseUrl + `/groups/underAuthority/${username}/${row.pathname}/users`, {}, {
                    username: username,
                    sessionId: sessionId
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

            $dropdown = $dropdown.clone(true, true);

            $col.find(".selectize-control, .selectized").remove();

            $col.append($dropdown);

            // Re-init
            $dropdown.selectize({
                options: options,
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
                searchField: "label"
            });

            $spinner.hide();
            //$dropdown.show();
        });

        // Add an event handler for the dropdown
        $dropdown.on("change", async function () {
            // Hide the table again
            $table.hide();

            // Remove the first header row if more than one exists
            if ($thead.find("tr").length > 1) {
                $thead.find("tr").first().remove();
            }

            const selectedUsername = $dropdown.val();

            // Show the user's name on top of the table
            const user = $(`#students-dropdown ~ .selectize-control:first .selectize-dropdown-content [data-value="${selectedUsername}"]`).data("user");

            // Wait for the table to generate
            try {
                await window.merlinProficiencyProgress(username, sessionId, selectedUsername, pathname);
            } catch (e) {
                error(e);
            }

            // Prepend the student's name to the table header
            $table.find("thead").prepend(`
<tr>
    <th colspan="7">
        <h2 class="text-center">${user.lastName}, ${user.firstName}</h2>
    </th>
</tr>
`);

            // Hide the spinner and show the table
            $table.show();
        });
    }
}

export default UsersTreeview;