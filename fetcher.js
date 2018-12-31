const config = require('./config');
const cron = require('node-cron');
const request = require('request');
const fs = require('fs');
const createCsvWriter = require('csv-writer').createArrayCsvWriter;
const csvWriter = createCsvWriter({
    header: ['carpark_number', 'lots_available', 'total_lots', 'lot_type'],
    path: './public/temp/lot_data.csv'

});

function fetch() {
    console.log('--> Fetching carpark data...');
    const options = {
        url: 'http://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
        headers: { 'AccountKey': config.AccountKey, 'accept': 'application/json' }
    };
    function callback(error, response, body) {
        console.log('--> Status code: ', response.statusCode);
        if (!error && response.statusCode == 200) {
            fs.writeFile("./public/temp/carpark_data.json", body, function(err) {
                if(err) { return console.log(err); }
                console.log("--> Carpark file saved @ " + new Date());
            }); 
        }
    }
    request(options, callback);
}

fetch();
cron.schedule('* * * * *', fetch);