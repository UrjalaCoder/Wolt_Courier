const fs = require('fs');
const path = require('path');
const City = require('./parser.js');
const configFilename = path.join(__dirname, "config.json");

/*
Main file for using the application.
*/

// Because the config file is usually very small we can read and write it multiple times without significant performance loss.
function readConfig() {
    return JSON.parse(fs.readFileSync(configFilename, "utf8"));
}

// Date should be YYYY-MM-DD
function parseDate(dateString) {
    if(!dateString || dateString === "") {
        return null;
    }

    let elements = dateString.split("-");
    // Turn the year, month and day strings to numbers.
    elements = elements.map((el) => Number(el));

    // Turn the numbers into a Date object. Remember that months start at 0.
    return new Date(elements[0], elements[1] - 1, elements[2]);
}

// Function used to get a location for a specific index.
function getLocation(callback) {
    let cityName = process.argv[3];
    let id = Number(process.argv[4]);

    if(!id) {
        callback("No ID provided!");
    }

    let config = readConfig();

    if(!config[cityName]) {
        callback("UNKNOWN city!");
    }

    let city = City.fromData(cityName, config[cityName]);
    callback(city.getLocation(id));
}

// Function for getting the data from a city.
function getData(callback) {
    let cityName = process.argv[3];
    let date = parseDate(process.argv[4]);
    let filename = process.argv[5];

    // If the filename doesn't end in '.csv', terminate.
    if(filename.split(".")[1] !== "csv") {
        callback("Invalid filename!");
    }

    if(!date) {
        callback("Invalid date!");
    }

    let config = readConfig();

    // First check that the city is in the config.
    // Return false if not.
    if(Object.keys(config).indexOf(cityName) === -1) {
        callback("Unkown city!");
        return;
    }
    // Create a new 'City' instance using the stored data.
    let city = City.fromData(cityName, config[cityName]);
    // console.log(city.data);
    let resultData = {};
    if(process.argv.length === 6) {
        resultData = city.getMedianBetween(date, 0, 24);
    } else if(process.argv.length === 7) {
        let startHour = Number(process.argv[6]);
        resultData = city.getMedianBetween(date, startHour, 24);
    } else if(process.argv.length === 8) {
        let startHour = Number(process.argv[6]);
        let endHour = Number(process.argv[7]);
        resultData = city.getMedianBetween(date, startHour, endHour);
    } else {
        // Invalid arguments!
        callback("Invalid args!");
        return;
    }
    // Finally
    // Store the data in a file using the 'store' function of 'city' object.
    city.store(process.argv[5], resultData);
    callback(null);
}

function removeConfig(callback) {
    let cityName = process.argv[3];

    if(!cityName) {
        callback("Invalid args!");
    }

    let oldConfig = readConfig();
    delete oldConfig[cityName];
    fs.writeFileSync(configFilename, JSON.stringify(oldConfig), 'utf8');
    callback(null);
}

function listConfig(callback) {
    callback("Cities in config:\n" + Object.keys(readConfig()).join("\n"));
}

// File used to store a new city field in config.
function storeFile(callback) {
    let cityName = process.argv[3];
    let locationsFile = process.argv[4];
    let pickupsFile = process.argv[5];

    if(!fs.existsSync(path.join(__dirname, locationsFile)) || !fs.existsSync(path.join(__dirname, pickupsFile))) {
        callback("No such file!");
    }

    // First read the config file.
    let rawData = fs.readFileSync(configFilename, 'utf8');
    let oldObject = JSON.parse(rawData);

    // Add new item.
    // Use the City constructor for parsing the data.
    let city = new City(cityName, locationsFile, pickupsFile);
    oldObject[cityName] = city.data;

    // Write the new data.
    fs.writeFileSync(configFilename, JSON.stringify(oldObject), 'utf8');
    callback(null);
}

function printUsage() {
    console.log("USAGE:")
    console.log("For getting pickup time information: \nnode app.js get [CITY_NAME] [DATE] [RESULT_FILENAME] {STARTHOUR} {ENDHOUR}\n");
    console.log("For getting location information: \nnode app.js location [CITY_NAME] [LOCATION_ID]\n");
    console.log("For storing the files for a city in config: \nnode app.js store [CITY_NAME] [LOCATIONS_FILE] [PICKUPS_FILE]\n");
    console.log("For removing a city from config: \nnode app.js remove [CITY_NAME]\n");
    console.log("For listing the cities in config: \nnode app.js list\n");
    return;
}

function main() {

    // Parse the desired functionality from command line args.
    let verb = process.argv[2];
    if(verb === "get") {
        getData((err) => {
            if(err) console.log(err);
            process.exit();
        });
    } else if(verb === "location") {
        getLocation((msg) => {
            console.log(msg);
            process.exit();
        })
    }
    else if(verb === "store") {
        storeFile((err) => {
            if(err) console.log(err);
            process.exit()
        });

    } else if(verb === "remove") {
        removeConfig((err) => {
            if(err) console.log(err);
            process.exit();
        });
    } else if(verb === "list") {
        listConfig((msg) => {
            console.log(msg);
            process.exit();
        })
    } else {
        printUsage();
        process.exit();
    }
}


main()
