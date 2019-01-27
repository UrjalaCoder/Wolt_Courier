# Wolt_Courier

## About
This is a project made for the 2019 engineering intern job. The program is a command line program written using javascript and the NodeJS javascript engine.
It calculates the MEDIAN pickup time for the different locations during a specific hour. Program stores them in a CSV file.

## Functionality
The main command for using the program is `node app.js [COMMAND] [ARGS...]`. The commands and args are:
* `get [CITYNAME] [DATE] [DATA_FILENAME] {START_HOUR} {END_HOUR}` This command is used to get the data. Arguments are:
  * `CITYNAME` The name of the city you want to examine. The city must be in config.
  * `DATE` The date you want to examine. Format is `YYYY-MM-DD` All start from index 1.
  * `DATA_FILENAME` The filename you want to use for storing the data. It's a relative path and OVERRIDES everything so please be careful :) Also make sure it ends in `.csv`.
  * `START_HOUR`: (Optional) The hour from which you want to start collecting data. Format: `HH`. If not provided starts at 00:00:00.
  * `END_HOUR`: (Optional) The hour that ends the data collection same format as start. If not provided ends at: 23:59:59
