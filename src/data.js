const stg = window.location.hostname == 'www.codermerlin.com' ? '' : 'stg';
const baseUrl = `https://api-server${stg ? '-' + stg : ''}.codermerlin.com`;

/**
 * Get the data from the API and process the results
 * 
 * @return {Promise} An array containing the topics and stages
 */
async function getData() {
    // Add the path
    const username = $('#mastery-progress-data').data('username');
    const sessionId = $('#mastery-progress-data').data('session-id');
    const path = `/mission-manager/users/${username}/mastery-progress/programs`;
    
    // Development
    let json;
    if (window.location.hostname == "") {
        json = {"rows":[{"proficientMinimumPoints":144,"exemplaryMinimumPoints":180,"masteryProgramTopicSequence":100,"emergingMinimumPoints":90,"masteryProgramTopicId":17,"masteryProgramLevelName":"White 1","masteryProgramTopicName":"Basic CLI Software Development Tools","developingMinimumPoints":117,"masteryProgramId":2,"userId":420,"masteryProgramName":"Merlin Maven 1000","pointsEarned":141,"totalPoints":180},{"proficientMinimumPoints":144,"exemplaryMinimumPoints":180,"masteryProgramTopicSequence":200,"emergingMinimumPoints":90,"masteryProgramTopicId":18,"masteryProgramLevelName":"White 2","masteryProgramTopicName":"Number Systems","developingMinimumPoints":117,"masteryProgramId":2,"userId":420,"masteryProgramName":"Merlin Maven 1000","pointsEarned":177,"totalPoints":180},{"proficientMinimumPoints":190,"exemplaryMinimumPoints":238,"masteryProgramTopicSequence":300,"emergingMinimumPoints":119,"masteryProgramTopicId":19,"masteryProgramLevelName":"White 3","masteryProgramTopicName":"Boolean Algebra","developingMinimumPoints":155,"masteryProgramId":2,"userId":420,"masteryProgramName":"Merlin Maven 1000","pointsEarned":216,"totalPoints":238},{"proficientMinimumPoints":72,"exemplaryMinimumPoints":90,"masteryProgramTopicSequence":400,"emergingMinimumPoints":45,"masteryProgramTopicId":20,"masteryProgramLevelName":"White 4","masteryProgramTopicName":"Computer History and Architecture","developingMinimumPoints":59,"masteryProgramId":2,"userId":420,"masteryProgramName":"Merlin Maven 1000","pointsEarned":90,"totalPoints":90},{"masteryProgramName":"Merlin Maven 1000","pointsEarned":299,"exemplaryMinimumPoints":395,"totalPoints":395,"masteryProgramId":2,"proficientMinimumPoints":316,"userId":420,"emergingMinimumPoints":198,"developingMinimumPoints":257,"masteryProgramTopicSequence":500,"masteryProgramTopicName":"Encoding and Data Types","masteryProgramTopicId":21,"masteryProgramLevelName":"White 5"},{"masteryProgramName":"Merlin Maven 1000","pointsEarned":150,"exemplaryMinimumPoints":150,"totalPoints":150,"masteryProgramId":2,"proficientMinimumPoints":120,"userId":420,"emergingMinimumPoints":75,"developingMinimumPoints":98,"masteryProgramTopicSequence":600,"masteryProgramTopicName":"Git and GitHub Basics","masteryProgramTopicId":22,"masteryProgramLevelName":"White 6"},{"masteryProgramName":"Merlin Maven 1000","pointsEarned":130,"exemplaryMinimumPoints":130,"totalPoints":130,"masteryProgramId":2,"proficientMinimumPoints":104,"userId":420,"emergingMinimumPoints":65,"developingMinimumPoints":85,"masteryProgramTopicSequence":700,"masteryProgramTopicName":"Scope Basics","masteryProgramTopicId":23,"masteryProgramLevelName":"White 7"},{"masteryProgramName":"Merlin Maven 1000","pointsEarned":130,"exemplaryMinimumPoints":130,"totalPoints":130,"masteryProgramId":2,"proficientMinimumPoints":104,"userId":420,"emergingMinimumPoints":65,"developingMinimumPoints":85,"masteryProgramTopicSequence":1100,"masteryProgramTopicName":"Basic Karel Algorithms","masteryProgramTopicId":24,"masteryProgramLevelName":"Yellow 1"},{"masteryProgramName":"Merlin Maven 1000","pointsEarned":150,"exemplaryMinimumPoints":150,"totalPoints":150,"masteryProgramId":2,"proficientMinimumPoints":120,"userId":420,"emergingMinimumPoints":75,"developingMinimumPoints":98,"masteryProgramTopicSequence":1200,"masteryProgramTopicName":"Basic Numeric Algorithms","masteryProgramTopicId":25,"masteryProgramLevelName":"Yellow 2"}]};
    } else {
        // Request the data
        json = await $.ajax(baseUrl + path, {
            headers: {
                username: username,
                sessionId: sessionId
            },
            dataType: "json"
        });
    }
    
    let rawData = json;
    
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
                date: (points >= minPoints) ? 'Passed' : formattedPct,
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