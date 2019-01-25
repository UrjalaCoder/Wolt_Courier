const fs = require('fs');
const path = require('path');

// Get the filenames -->
const filename_locations = process.argv[2];
const filename_times = process.argv[3];

// data object to hold the information -->
let data = {};


// Object to store the location and pickup data for one city.
class City {
    constructor(locationName, locationFile, timeFile) {
        this.name = locationName;
        this.locationFilename = locationFile;
        this.pickupFilename = timeFile;
        this.data = this.initializeData();
    }

    initializeData() {
        let locationData = parseLocations(this.locationFilename);
        let pickupData = parseTimes(this.pickupFilename);
        return combineData(pickupData, locationData);
    }
}

// Helper functions for loading and parsing the data from CSV files.
function parseLocations(filePath) {
    let lines = loadFile(filePath, "\r\n");
    let data_object = {};

    // Also remove the first header
    let header = lines.shift();
    header = header.split(",");

    // Separate the data to 2D array.
    let locations = lines.map((el) => {
        let line = el.split(",");
        // Turn string values to numbers -->
        line = line.map((el) => Number(el));
        return line;
    });

    // Add location data to data_object
    // Use id as the key.

    locations.forEach((el, index) => {
        data_object[el[0]] = {[header[1]]: el[1], [header[2]]: el[2]};
    });

    return data_object;
}

// Function to load files synchronously. Returns the lines separated by 'separator' parameter.
function loadFile(filePath, separator) {
    let data = fs.readFileSync(path.join(__dirname, filePath), 'utf8');
    return data.split(separator).filter((line) => { return (line !== ""); });
}

function parseTimes(filePath) {
    let lines = loadFile(filePath, "\r\n");
    let data_object = {};

    let header = lines.shift().split(",");

    // Create a 2D array of the pickup events. -->
    //
    let times = lines.map((el) => {
        let line = el.split(",");
        // Create a Date object and save it to the array.
        let date = new Date(Date.parse(line[1]));
        let id = Number(line[0]);
        return [Number(line[0]), date, Number(line[2])];
    });

    times.forEach((el) => {
        // For each pickup event, store the time of the pickup and time that the pickup took.
        // Use the 'data_object' object to store the events and use the location ID as the key.

        let id = el[0];

        if(!data_object[id]) {
            data_object[id] = [];
        }

        data_object[id].push({
            'timestamp': el[1],
            'pickup_time': el[2]
        });
    });
    return data_object;
}

function combineData(timeData, locationData) {
    // Combine the time and location data to one data object.
    let data = {};
    Object.keys(locationData).forEach((id) => {
        data[id] = {'location': locationData[id], 'pickup_times': timeData[id]};
    });
    return data;
}
