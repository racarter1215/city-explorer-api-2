'use strict';

const express = require('express');
const superagent = require('superagent');
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
    let city= request.query.city;
    let locationUrl = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

        superagent.get(locationUrl)
        .then(finalLocationStuff => {
            let location = new Location(city, finalLocationStuff.body[0]);
            response.status(200).send(location);
        }).catch(error => {
        response.status(500).send('this did not work as expected');  
        }) 
    })

app.get('/weather', (request, response) => {
    try {
    let weatherData = require('./data/weather.json');
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
