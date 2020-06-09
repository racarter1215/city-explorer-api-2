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
    }
    let returnLocation = {
        search_query: search_query,
        formatted_query: geoData[0].display_name,
        latitude: geoData[0].lat,
        longitude: geoData[0].lon
    }
    response.status(200).send(returnLocation);
} 
catch(err) {
    response.status(500).send('this did not go as planned');
}


app.listen(PORT, () => {
    console.log(`listening on ${PORT}`);
  })