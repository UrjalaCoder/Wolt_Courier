const fs = require('fs');
const path = require('path');
const City = require('./parser.js');
const configFilename = path.join(__dirname, "config.json");
const readLine = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

/*

Main file for using the application.
USAGE:
- Get pickup data:
    node app.js get [CITY_NAME] [DATE] {STARTHOUR} {ENDHOUR}
- Get location data:
    node app.js location [CITY_NAME] [LOCATION_INDEX]
- Set the data files of a city
    node app.js store [CITY_NAME] [LOCATIONS_FILE] [PICKUPS_FILE]
- Remove a city from config.
    node app.js remove [CITY_NAME]
*/


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

    let city = new City(cityName, config[cityName]['locationFile'], config[cityName]['pickupFile']);
    callback(city.getLocation(id));
}

function getData(callback) {
    let cityName = process.argv[3];
    let date = parseDate(process.argv[4]);

    if(!date) {
        callback("Invalid date!");
    }

    let config = readConfig();

    // First check that the city is in the config.
    // Return false if not.
    if(Object.keys(config).indexOf(cityName) === -1) {
        callback("Invalid args!");
        return;
    }
    // Create a new 'City' instance.
    let city = new City(cityName, config[cityName]['locationFile'], config[cityName]['pickupFile']);
    let resultData = {};
    if(process.argv.length === 5) {
        resultData = city.getMedianBetween(date, 0, 24);
    } else if(process.argv.length === 6) {
        let startHour = Number(process.argv[5]);
        resultData = city.getMedianBetween(date, startHour, 24);
    } else if(process.argv.length === 7) {
        let startHour = Number(process.argv[5]);
        let endHour = Number(process.argv[6]);
        console.log(startHour);
        resultData = city.getMedianBetween(date, startHour, endHour);
    } else {
        // Invalid arguments!
        callback("Invalid args!");
        return;
    }

    // Store the data into a file.
    // First ask the user where the data should be stored.
    readLine.question("Store filename:", (filename) => {
        city.store(filename, resultData);
        callback(null);
    });
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
    oldObject[cityName] = {'locationFile': locationsFile, 'pickupFile': pickupsFile};

    // Write the new data.
    fs.writeFileSync(configFilename, JSON.stringify(oldObject), 'utf8');

    callback(null);
}

function printUsage() {
    console.log("For getting information: node app.js get [CITY_NAME] [DATE] {STARTHOUR} {ENDHOUR}");
    console.log("For storing the files under a city name: node app.js store [CITY_NAME] [LOCATIONS_FILE] [PICKUPS_FILE]");
    return;
}

function main() {
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
    } else {
        printUsage();
        process.exit();
    }
}


main()
