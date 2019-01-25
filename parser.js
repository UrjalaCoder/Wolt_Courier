const fs = require('fs');
const path = require('path');

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

    // Returns true if the pickup event is in between the starting and end hours on the specific date.
    isIncluded(date, startingHour, endHour, pickup) {
        let startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startingHour);
        let endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour);
        let pickupStamp = pickup['timestamp'];
        // console.log(pickup);
        // Return if the startDate is earlier than pickup AND pickup is earlier than endDate AND startDate is earlier than endDate.
        return (startDate <= pickupStamp && pickupStamp <= endDate && startDate < endDate);
    }

    // Get the pickup event for each location filtered by time.
    getDataBetween(date, startingHour, endHour) {
        let result = {};
        // For every location in data
        for(let key in this.data) {
            // For every pickup event in this location.
            for(let pickup of this.data[key]['pickup_times']) {
                if(this.isIncluded(date, startingHour, endHour, pickup)) {
                    // If the result object has no array for that key yet, create it.
                    if(!result[key]) {
                        result[key] = [];
                    }
                    // Add the pickup event to the 'result' object.
                    result[key].push(pickup);
                }
            }
        }

        return result;
    }

    calculateMedian(arr) {
        // Sort the array
        arr.sort((a, b) => a-b);

        // Get the half point
        let half = Math.floor(arr.length / 2.0);

        // If NOT divisible by 2.
        // Return the middle element of the sorted list.
        if(arr % 2) {
            return arr[half]
        } else {
            return ((arr[half - 1] + arr[half]) * 0.5);
        }
    }


    // Stores the median times to the filePath
    store(filePath, data) {
        let lines = [];
        for(let key in data) {
            lines.push(`${key},${data[key]}`);
        }

        let writeString = lines.join("\r\n");
        fs.writeFileSync(path.join(__dirname, filePath), writeString, 'utf8');
    }

    getMedianBetween(date, startingHour, endHour) {
        // Get the pickup data between the start and end hours.
        let pickups = this.getDataBetween(date, startingHour, endHour);
        let times = {};
        // console.log(pickups);
        // For every location.
        // Add the pickup times to the 'times' object.
        for(let key in pickups) {
            for(let event of pickups[key]) {
                if(!times[key]) {
                    times[key] = [];
                }
                times[key].push(event['pickup_time']);
            }
        }
        let medians = {};
        // For every location, calculate the median.
        for(let key in times) {
            medians[key] = this.calculateMedian(times[key]);
        }

        return medians;
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

module.exports = City;
