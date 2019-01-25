const fs = require('fs');
const path = require('path');

// Get the filenames -->
const filename_locations = process.argv[2];
const filename_times = process.argv[3];

// data object to hold the information -->
let data = {};

function parseLocations() {
    let lines = loadFile(filename_locations, "\r\n");
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

function parseTimes() {
    let lines = loadFile(filename_times, "\r\n");
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
            'time_date': el[1],
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

function isDateIn(targetDate, targetHour, date) {
    // 'targetDate' is a date object with the year month and day.
    // 'targetHour' is a Number that describes the time interval that we're interested in.
    // 'targetHour' is the starting point.
    let targetDateObject = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), targetHour);
    let difference = date - targetDateObject;

    // If the diffenrece in microseconds is less than one hour.
    // Also check that the date is more larger than the start of the hour.
    return (difference < 60 * 60 * 1000 && difference >= 0);
}

function getPickUpTimesIn(data, date, hour) {
    let resultData = {};

    // For every location
    for(id in data) {
        let times = data[id]['pickup_times'];
        // For every pickup from that location.
        for(let i = 0; i < times.length; i++) {
            // If the pickup was done in the timeslot in question.
            // Add the pickup to the 'resultData' object.
            // Object has an array associated with every ID. The array stores the pickup events.
            /*
            *   ID: {[{'time_date': time of the pickup, 'pickup_time': time that the pickup took}, ...]}
            */
            if(isDateIn(date, hour, times[i]['time_date'])) {
                if(!resultData[id]) {
                    resultData[id] = [times[i]];
                } else {
                    resultData[id].push(times[i]);
                }
            }
        }
    }

    return resultData;
}

function calculateMedian(arr) {
    let array = arr.slice();

    // Sort the array in increasing order.
    array.sort((a, b) => a - b);

    let half = Math.floor(arr.length / 2.0);
    if(arr.length % 2 !== 0) {
        return array[half];
    } else {
        return (array[half - 1] + array[half]) / 2.0;
    }
}

function getMedian(data, date, hour) {
    let times = {};
    let results = getPickUpTimesIn(data, date, hour);

    // For every pickup location in that timeslot.
    for(id in results) {
        // For every pickup done for that location.
        // Store the time that the pickup took to the 'times' object.
        /*
        *   ID: {[time it took for a pickup, another time, ...]}
        */
        for(time of results[id]) {
            if(!times[id]) {
                times[id] = [];
            }
            times[id].push(time['pickup_time']);
        }
    }

    let medians = {};
    // For every location
    // Calculate the median pickup time and store in the 'medians' object.
    /*
    *   ID: {median pickup time}
    */
    for(key in times) {
        medians[key] = calculateMedian(times[key]);
    }

    return medians;
}

function main() {
    let times = parseTimes();
    let locations = parseLocations();
    let data = combineData(times, locations);
}

main();
