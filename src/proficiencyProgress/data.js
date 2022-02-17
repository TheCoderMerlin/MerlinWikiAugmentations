import $ from 'jquery';
import {getJson, apiBaseUrl} from '../http';

const baseUrl = apiBaseUrl;

/**
 * Get the data from the API and process the results
 * 
 * @param  {string} username
 * @param  {string} sessionId
 * @param  {?string} custom A custom username to get data for instead
 * @param  {?string} pathname The current pathname
 * @return {Promise} An array containing the topics and stages
 */
async function getData(username, sessionId, custom = null, pathname = null) {
    custom = custom || username;

    let rawData = await (async function () {
        const path = `/mission-manager/users/${custom}/mastery-progress/programs`;

        let headers = {
            username: username,
            sessionId: sessionId,
        };

        // Only add this header if the requested data is for a different user
        if (custom !== username) {
            headers['assertImpersonationAuthority'] = pathname;
        }

        // Request the data
        return getJson(baseUrl + path, [], headers);
    })();
    
    // Re-order everything by the sequence
    const orderKey = 'masteryProgramTopicSequence';

    rawData.sort(function(a, b) {
        if (a[orderKey] > b[orderKey]) {
            return -1;
        } else if (a[orderKey] < b[orderKey]) {
            return 1;
        } else {
            return 0;
        }
    });

    // Build the data
    let data = [];
    
    const stages = ['Inevident', 'Emerging', 'Developing', 'Proficient', 'Exemplary'];

    // The level names (e.g. White, Yellow, etc.)
    let levels = [];

    // Keep track of the current color
    let currentColor = '';

    // Iterate over all of the returned rows
    for (let i = 0; i < rawData.length; i++) {
        // Get the row
        let row = rawData[i];
        
        // Extract the necessary info
        const points = row['pointsEarned'];
        let dataRow = {};

        // Simplify the object keys
        // Also remove unnecessary data to reduce memory usage
        dataRow['topic'] = row['masteryProgramTopicName'];
        dataRow['topic_id'] = row['id'];
        dataRow['program_id'] = row['masteryProgramId'];
        dataRow['level_name'] = row['masteryProgramLevelName'];
        dataRow['level_group'] = dataRow['level_name'].split(' ')[0];
        dataRow['data'] = [];

        // Add to the levels array
        levels.push(dataRow['level_group']);
        
        // Iterate over the stages
        for (let j = 0; j < stages.length; j++) {
            // Build the key for the minimum points to get to a stage
            let stageKey = stages[j].toLowerCase() + 'MinimumPoints';
            
            // The minimum points
            const minPoints = row[stageKey];
            
            // Calculate the percentage complete
            let pct = points / minPoints;
            
            // If the last stage isn't complete, the next one can't be either
            if (j > 0 && dataRow['data'][j - 1]['pct'] < 1.0) {
                pct = 0.0;
            }

            //let formattedPct = (pct > 0) ? Math.round(pct * 100) + '%' : '';
            
            dataRow['data'].push({
                date: (points >= minPoints) ? 'Passed' : '',
                pct: pct
            });
        }

        // If the second element is complete, mark the first one as such
        if (dataRow['data'][1].date === 'Passed' || dataRow['data'][1].pct > 0.0) {
            dataRow['data'][0].date = 'Passed';
            dataRow['data'][0].pct = 1.0;
        }

        data.push(dataRow);
    }

    // Remove duplicates from levels
    levels = [... new Set(levels)];

    return [levels, data];
}

export default getData;

export {
    getData,
    baseUrl,
}