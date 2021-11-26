import $ from 'jquery';
const jQuery = $;

class Table {
    /**
     * @param {jQuery} $table The jQuery object for the table element
     */
    constructor($table) {
        this._$table = $table;
    }

    /**
    * Add a row to a table
    * 
    * @param  {Array} cells An array of cells to add to the table
    * @param  {Object} attrs Any attributes to set on the row
    * @return {jQuery} The row jQuery object
    */
    addRow(cells, attrs = {}) {
        // Figure out tbody
        const $tbody = this._$table.find('tbody');
        
        // Create an empty row
        let $row = $(`<tr></tr>`);
        
        // Iterate over each cell
        for (let i = 0; i < cells.length; i++) {
            // Get the cell
            const cell = cells[i];
            
            let $cell = null;
            
            // Check if it should be a th or td
            if (cell.header) {
                $cell = $('<th scope="row"></th>');
            } else {
                $cell = $('<td></td>');
            }
            
            // Set any necessary attributes
            if (cell.attributes && (typeof cell.attributes == 'object')) {
                for (let [key, value] of Object.entries(cell.attributes)) {
                    // Combine into a string if needed
                    if (Array.isArray(value)) {
                        value = value.join(' ');
                    }
                    
                    // Set the attribute
                    $cell.attr(key, value);
                }
            }
            
            // Set the cell data
            $cell.html(cell.data);
            
            // Add to the cell to the row
            $row.append($cell);
        }
        
        // Add attributes to the row
        for (const [key, value] of Object.entries(attrs)) {
            $row.attr(key, value);
        }
        
        $tbody.append($row);
        
        return $row;
    }
}

export default Table;