const City = require('./parser.js');

// Parses the command line arguments.
// Returns null if problem otherwise an Array [locationFilename, pickupFilename]
function parseArgs() {
    let locationFile = process.argv[2];
    let pickupFile = process.argv[3];

    if(!locationFile || !pickupFile) {
        return null;
    } else if(locationFile === "" || pickupFile === "") {
        return null;
    } else {
        return {'locationFile': locationFile, 'pickupFile': pickupFile};
    }
}

function main() {
    let {locationFile, pickupFile} = parseArgs();
    if(!locationFile || !pickupFile) {
        console.log("Invalid args!");
        return;
    }

    let city = new City("City A", locationFile, pickupFile);
    let test = new Date(2019, 0, 12);
    let m = city.getMedianBetween(test, 12, 13);
    console.log(m);
    city.store("/test.csv", m);

}


main()
