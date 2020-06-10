'use strict'

require('dotenv').config();

const express = require('express');
const pg = require('pg');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const app = express();
app.use(cors());

function Location(city, geo) {
    this.search_query = city;
    this.formatted_query = geo.display_name;
    this.latitude = geo.lat;
    this.longitude = geo.lon;
}

function Weather(date, forecast) {
    this.forecast = forecast;
    this.time = new Date(date).toDateString();
}

app.get('/location', (request, response) => {
    try {
    let search_query = request.query.city;
    let geoData = require('/data/location.json');
    let returnLocation = new Location(search_query, geoData[0]);

    response.status(200).send(returnLocation);
    } catch(error) {
      response.status(500).send('this did not work as expected');  
    } 
})

app.get('/weather', (request, response) => {
    try {
    let forecast = request.query.forecast;
    let weatherData = require('/data/weather.json');
    let returnWeather = new Weather(forecast, weatherData[0]);

    response.status(200).send(returnWeather);
    } catch(error) {
      response.status(500).send('this did not work as expected');  
    } 
})

