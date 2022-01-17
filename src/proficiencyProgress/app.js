import Table from '../table';
import getData from './data';
import $ from 'jquery';
import addTopicHandlers from '../topics';

/**
 * Build the proficiency progress table
 * 
 * @param {string} username
 * @param {string} sessionId 
 */
function merlinProficiencyProgress(username, sessionId) {
    // Get a table instance
    let $table = $('table#mastery-progress-table');
    let table = new Table($table);
    
    // Fetch the data
    let $rows = [];
    getData(username, sessionId).then(async function ([levels, data]) {
        let currentLevel = undefined;
        let newLevel = undefined;

        // Iterate over each topic
        for (let i = 0; i < data.length; i++) {
            let topic = data[i];

            newLevel = topic['level_group'];

            if (newLevel != currentLevel) {
                // Add a level row
                table.addRow([
                    {
                        header: true,
                        data: newLevel,
                        attributes: {
                            colspan: 7,
                            class: 'text-center',
                            style: `background-color: ${newLevel.toLowerCase()}; border: none;`
                        }
                    }
                ]);
            }

            currentLevel = newLevel;

            let cells = [];

            // First, add a colored cell as per the level
            cells.push({
                data: '',
                attributes: {
                    style: `background-color: ${newLevel.toLowerCase()}; border: none;`,
                }
            });
                        
            // Set the first row to the title
            cells.push({
                header: true,
                data: `<span class="topic-name text-primary" style="cursor: pointer;" data-topic-id="${topic['topic_id']}" data-program-id="${topic['program_id']}">${topic.topic}</span>`,
                attributes: {
                    style: `background-color: ${topic.data.slice(-2)[0].date ? 'lightgreen' : 'lightgray'};`,
                }
            });
            
            // Iterate over the rest of the data
            for (let j = 0; j < topic.data.length; j++) {
                let stage = topic.data[j];
                
                // Calculate the RGB green value
                const m = 15;
                const greenColor = ((j + 1) * m) + (240 - (m * topic.data.length));
                
                // Get the percentage rounded to 2 decimal places
                //  4 because a percentage is a decimal anyways
                const pct = parseFloat(stage.pct).toFixed(4);
                
                // Background color for the cell
                let backgroundColor = `rgb(0, ${greenColor}, 0)`;
                
                // If not complete, the background should be blue
                if (pct < 1.0) {
                    backgroundColor = "rgb(0, 167, 225)";
                }
                
                // Append
                cells.push({
                    header: false,
                    data: stage.date,
                    attributes: {
                        //style: `background-color: ${(stage.date) ? `rgb(0, ${greenColor}, 0)` : 'lightgray'}; text-align: center;`,
                        style: `background-image: linear-gradient(to right, ${backgroundColor} ${pct * 100}%, lightgray 0%); text-align: center;`
                    }
                });
            }
            
            // Add to the table
            let $row = table.addRow(cells, {style: 'opacity: 0.0;'});
            
            $rows.push($row);
        }
        
        for (let i = 0; i < $rows.length; i++) {
            let $row = $rows[i];
            
            // Animate
            const animationTime = 200;
            
            $row.animate({opacity: 1.0}, animationTime);
            
            // Wait for half of the animation
            await (new Promise(resolve => setTimeout(resolve, animationTime / 5)));
        }

        // Add the callbacks for each topic
        addTopicHandlers($table, 'topic-name');
    });
}

export default merlinProficiencyProgress;