const NodeGeocoder = require('node-geocoder');
const dotenv = require('dotenv').config({path:'./config/config.env'});
console.log(`Variables ${process.env.GEOCODER_PROVIDER} ${process.env.GEOCODER_API_KEY}`)
const options = {
    
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
}
//For more info: https://github.com/nchaulet/node-geocoder/blob/master/README.md

const geocoder = NodeGeocoder(options);
module.exports = geocoder;