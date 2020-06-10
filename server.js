'use strict';

const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3000;

function Location(city, geo) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

function Weather(obj) {
    this.forecast = obj.weather.description;
    this.time = new Date(obj.valid_date).toDateString();
}

app.get('/location', (request, response) => {
    try {
    let search_query = request.query.city;
    let geoData = require('./data/location.json');
    let returnLocation = new Location(search_query, geoData[0]);
    console.log(returnLocation)

    response.status(200).send(returnLocation);
    } catch(error) {
      response.status(500).send('this did not work as expected');  
    } 
})

app.get('/weather', (request, response) => {
    try {
    let weatherData = require('./data/weather.json');
    console.log('test');
    let returnWeather = weatherData.data.map(weatherValue => {
         return new Weather(weatherValue);
    })
    response.status(200).send(returnWeather);
    } catch(error) {
      response.status(500).send('this did not work as expected');  
    } 
})

app.get('*',(request, response) => {
    response.status(404).send('Sorry, something is wrong');
})

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
