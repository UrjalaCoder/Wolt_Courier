const fs = require('fs');
const path = require('path');

// Get the filenames -->
const filename_locations = process.argv[2];
const filename_times = process.argv[3];

// data_object to hold the information -->
let data_object = {};

function parseLocations(callback) {
    let data = loadFile(filename_locations);

    // Get the lines of the file. Remove empty lines.
    let lines = data.split("\r\n").filter((line) => {
        return (line !== "");
    });

    // Also remove the first header
    let header = lines.shift();

    console.log(header);
    console.log(lines);
}

// Function to load files synchronously.
function loadFile(filePath) {
    return fs.readFileSync(path.join(__dirname, filePath), 'utf8');
}


// Main function -->
(function() {
    parseLocations();
})();
