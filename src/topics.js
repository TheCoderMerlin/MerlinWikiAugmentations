import $ from 'jquery';
import {getJson, wikiBaseUrl, apiBaseUrl} from './http';

const baseUrl = wikiBaseUrl;

/**
 * Set the href for a mission
 * 
 * @param {jQuery} $mission The jQuery object for the mission list element
 * @param {string} missionId The mission's identifier
 * @returns {undefined}
 */
async function setMissionHref($mission, missionId) {
    // Make the API request to get the URL
    let path = `/wiki/api.php?action=ask&query=[[Merlin%20mission::${missionId}]]&format=json&api_version=3`;

    getJson(baseUrl + path).then(function (data) {
        // Extract the query from the data
        let query = data['query'];
        let results = query['results'];

        // Only add the link if the results array isn't empty
        if (results.length > 0) {
            // Get the result
            let result = results[0];

            // Get the first key
            let data = result[Object.keys(result)[0]];
            
            $mission.html(`<a href="${data['fullurl']}" target="_blank">${$mission.text()}</a>`);
        } else {
            $mission.html(`<span class="text-danger">${$mission.text()}</span>`);
        }
    });
}

/**
 * Build the complete name for a mission
 * 
 * @param {Object} mission The mission to generate the name for
 * @return {string} The mission name
 */
function buildMissionName(mission) {
    return `M${mission['sequence']}-${mission['suffix']}: ${mission['name']}`;
}

/**
 * Handle a topic press
 * 
 * @param {Event} event 
 * @returns {Promise}
 */
async function handleTopicPress(event) {
    // Get the target as a jQuery object
    let $target = $(event.target);

    // If the list already exists, close it or open instead of calling the API again
    let $list = $target.siblings('div:has(ul)');

    if ($list.length > 0) {
        if ($list.is(':visible')) {
            $list.slideUp();
        } else {
            $list.slideDown();
        }

        return;
    }

    // Extract the topic and program id
    const topicId = $target.data('topic-id');
    const programId = $target.data('program-id');

    // Make the API request
    let path = `/mission-manager/mastery-programs/${programId}/topics/${topicId}/missions`;

    // Fetch the missions
    let missions = (await getJson(apiBaseUrl + path));

    // Sort by name
    missions.sort(function (left, right) {
        // Build the names
        const leftMissionName = buildMissionName(left);
        const rightMissionName = buildMissionName(right);

        if (leftMissionName < rightMissionName) {
            return -1;
        } else if (leftMissionName > rightMissionName) {
            return 1;
        } else {
            return 0;
        }
    });

    // Create an unordered list
    $list = $('<ul style="display: none;"></ul>');

    // Iterate over the missions rows
    for (let i = 0; i < missions.length; i++) {
        let mission = missions[i];

        // Add to the list
        let $li = $(`<li>${buildMissionName(mission)}</li>`);

        // Set the href
        setMissionHref($li, `M${mission['sequence']}-${mission['suffix']}`);

        $list.append($li);
    }

    // Append after the name
    $list = $list.wrap('<div></div>').parent();
    //$list.prepend($target.wrap('<div></div>').parent().html());
    $target.parent().append($list);
    $list.find('ul').slideDown();
}

/**
 * Add the callbacks for the handlers
 * 
 * @param  {jQuery} $table The jQuery table object
 * @param  {string} className The name of the CSS class identifying a topic name
 * @returns {undefined}
 */
function addTopicHandlers($table, className) {
    // Iterate over each of the topic names
    $table.find('.' + className).click(handleTopicPress);
}

export default addTopicHandlers;