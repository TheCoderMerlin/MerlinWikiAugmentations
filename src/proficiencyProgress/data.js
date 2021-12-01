import $ from 'jquery';
import getJson from '../http';

const stg = window.location.hostname == 'www.codermerlin.com' ? '' : 'stg';
const baseUrl = `https://api-server${stg ? '-' + stg : ''}.codermerlin.com`;

/**
 * Make the API request
 * 
 * @param {string} username 
 * @param {string} sessionId 
 * @returns 
 */
async function callApi(username, sessionId) {
    // Add the path
    const path = `/mission-manager/users/${username}/mastery-progress/programs`;

    // Request the data
    let json = await getJson(baseUrl + path, [], 
        {
            username: username,
            sessionId: sessionId
        });

    return json;
}

/**
 * Get the data from the API and process the results
 * 
 * @param  {string} username
 * @param  {string} sessionId
 * @return {Promise} An array containing the topics and stages
 */
async function getData(username, sessionId) {    
    let rawData = await callApi(username, sessionId);
    
    // Re-order everything by the sequence
    const orderKey = 'masteryProgramTopicSequence';
    
    rawData.rows.sort(function(a, b) {
        if (a[orderKey] > b[orderKey]) {
            return -1;
        } else if (a[orderKey] < b[orderKey]) {
            return 1;
        } else {
            return 0;
        }
    });
    
    let data = [];
    
    const stages = ['Inevident', 'Emerging', 'Developing', 'Proficient', 'Exemplary'];
    
    for (let i = 0; i < rawData.rows.length; i++) {
        // Get the row
        let row = rawData.rows[i];
        
        // Extract the necessary info
        const points = row['pointsEarned'];
        let dataRow = {};
        
        dataRow['topic'] = row['masteryProgramTopicName'];
        dataRow['topic_id'] = row['masteryProgramTopicId'];
        dataRow['program_id'] = row['masteryProgramId'];
        dataRow['data'] = [];
        
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
            
            let formattedPct = (pct > 0) ? Math.round(pct * 100) + '%' : '';
            
            dataRow['data'].push({
                date: (points >= minPoints) ? 'Passed' : '',
                pct: pct
            });
        }
        
        data.push(dataRow);
    }
    
    
    return data;
}

export default getData;

export {
    getData,
    baseUrl,
    stg
}