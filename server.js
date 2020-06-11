'use strict';

const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const dbClient = new pg.Client(process.env.DATABASE_URL);
const app = express();
require('dotenv').config();
const cors = require('cors');
app.use(cors());

const PORT = process.env.PORT || 3001;

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

function Trails(trail) {
    this.name = trail.name;
    this.location = trail.location;
    this.length = trail.length;
    this.stars = trail.stars;
    this.star_votes = trail.starVotes;
    this.summary = trail.summary;
    this.trail_url = trail.url;
    this.conditions = trail.conditions;
    this.condition_date = trail.conditionDate;
    this.condition_time = trail.conditionTime;
}

app.get('/location', (request, response) => {
    const city = request.query.city;
    const locationUrl = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;
    superagent.get(locationUrl) 
        .then(finalLocationStuff => {
            const data = finalLocationStuff.body;
            for (var i in data) {
                if (data[i].display_name[0].search(city)) {
                    const location = new Location(city, data[i]);
                    response.send(location);
                    
                }
            }
        }).catch(error => {
        errorHandler(error, request, response);
    });
});

app.get('/weather', (request, response) => {
    const { latitude, longitude} = request.query;
    const weatherUrl = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${latitude}&lon=${longitude}&key=${process.env.WEATHER_API_KEY}`
    
    superagent.get(weatherUrl)
        .then(finalWeatherStuff => {
            const data = finalWeatherStuff.body.data;
            response.send(data.map(weatherValue => {
                return new Weather(weatherValue);
            }))
        }).catch(error => {
            errorHandler(error, request, response);;  
    }) 
})

app.get('/trails', (request, response) => {
    const { latitude, longitude} = request.query;
    const locationUrl = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${process.env.TRAIL_API_KEY}`

        superagent.get(locationUrl)
        .then(finalTrailStuff => {
            const data = finalTrailStuff.body.trails;
            response.send(data.map(trailValue => {
                return new Trails(trailValue);
            }));
        }).catch(error => {
            errorHandler(error, request, response);;  
        }) 
    })

app.get('*',(request, response) => {
    response.status(404).send('Sorry, something is wrong');
})

function errorHandler(error, request, response) {
    response.status(500).send({status: 500, responseText: 'That did not go as expected'});
  }

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});
