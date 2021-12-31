import {getJson, apiBaseUrl, wikiBaseUrl} from '../http';
import Table from '../table';
import $ from 'jquery';
import addTopicHandlers from '../topics';
import {reverseSort} from '../sorting';
import moment from 'moment';

/**
 * Main entrypoint
 * 
 * @param  {string} username The username (used for authentication)
 * @param  {string} sessionId The session ID (used for authentication)
 * @return {undefined}
 */
async function sashesEarned(username, sessionId)
{
    // Make the API call
    let data = await getJson(`${apiBaseUrl}/mission-manager/users/john-williams/sash-awards/programs`, [], {
        username: username,
        sessionId: sessionId
    });

    let rows = data['rows'];

    // Sort the array in reverse order
    rows.sort(function(a, b) {
        return reverseSort('masteryProgramTopicSequence', a, b);
    });

    // Set up the table class
    let $table = $('#sashes-earned-table');
    let table = new Table($table);

    // Hide
    $table.hide();

    // Iterate over the rows and update the table
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        //console.log(row);

        let cells = [];

        cells.push({
            header: true,
            data: `<span class="topic-name text-primary" style="cursor: pointer;" data-topic-id="${row['masteryProgramTopicId']}" data-program-id="${row['masteryProgramId']}">${row['masteryProgramTopicName']}</span>`,
        });

        cells.push({
            data: `<div class="d-flex justify-content-center align-items-center badge-image-wrapper" style="opacity: 0;">
                <a href="${row['externalOpenBadgeId']}" target="_blank" title="${row['masteryProgramTopicLevelName']}">
                    <img style="object-fit: contain; height: 200px; width: 200px;" alt="${row['masteryProgramTopicLevelName']} badge" src="${wikiBaseUrl}${row['sashImageUri']}">
                    <p class="text-center small">${moment(row['awardTimestamp']).format('MMMM Do YYYY, h:mm a')}</p>
                </a>
            </div>`
        });

        table.addRow(cells);
    }

    // Show the table
    $table.show();

    let time = 0;

    $('.badge-image-wrapper').each(function () {
        $(this).delay(time).animate({'opacity': 1}, 1000)

        time += 50;
    });

    addTopicHandlers($table, 'topic-name');
}

export default sashesEarned;