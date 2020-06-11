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

function Yelp(obj) {
    this.name = obj.name;
    this.image_url = obj.image_url;
    this.price = obj.price;
    this.rating = obj.rating;
    this.url = obj.url;
}

function Movie(obj) {
    this.title = obj.title;
    this.overview = obj.overview;
    this.average_votes = obj.vote_average;
    this.total_votes = obj.vote_count;
    this.image_url = `https://image.tmdb.org/t/p/w500${obj.poster_path}`;
    this.popularity = obj.popularity;
    this.released_on = obj.release.date;
}

app.get('/location', (request, response) => {
    const city = request.query.city;
    const locationUrl = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEOCODE_API_KEY}&q=${city}&format=json`;
    let sql =   `SELECT * FROM locations WHERE search_query LIKE ($1);`;
    let searchValues = [city];

    dbClient.query(sql, searchValues)
        .then(store => {
            if (store.rows > 0) {
                response.status(200).send(record.rows[0]);
            } else {
                superagent.get(locationUrl) 
                    .then(finalLocationStuff => {
                        let location = new Location(city, finalLocationStuff.body[0]);
                        console.log('first one', location);
                        let sqlAdd = `INSERT INTO locations (search_query, formatted_query, latitude, longitude) VALUES ($1, $2, $3, $4);`;
                        let searchValues = [cityQuery, location.formatted_query, location.latitude, location.longitude]
                        dbClient.query(sqlAdd, searchValues)
                            .then( () => {}).catch();
                        response.status(200).send(location);
                        console.log('second one', location);
                }).catch(error => {
                errorHandler(error, request, response);
                });
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
    const trailUrl = `https://www.hikingproject.com/data/get-trails?lat=${latitude}&lon=${longitude}&key=${process.env.TRAIL_API_KEY}`;

        superagent.get(trailUrl)
            .then(finalTrailStuff => {
                const data = finalTrailStuff.body.trails;
                response.send(data.map(trailValue => {
                    return new Trails(trailValue);
                }));
            }).catch(error => {
                errorHandler(error, request, response);
            }) 
    })

app.get('/yelp', yelpHandler);

function yelpHandler(request, response) {
    let yelpUrl = `https://api.yelp.com/v3/businesses/search`;
    const page = request.query.page;
    const numPerPage = 5;

    const start = (page - 1 * numPerPage);

    const queryParams = {
        latitude: request.query.latitude,
        longitude: request.query.longitude,
        limit: numPerPage,
        offset: start
    }
  
    superagent.get(yelpUrl)
    .set({ 'Authorization': 'Bearer ' + process.env.YELP_API_KEY})
    .query(queryParams)
    .then(yelpResponse => {
        const yelpData = yelpResponse.body.businesses.map(data => {
         return new Yelp(data);
        });
        response.status(200).send(yelpData);
      }).catch(error => handleError(error, request, response));
  };

app.get('/movies', (request, response) => {
    let city = request.query.search_query;
    let key = process.env.MOVIE_API_KEY;
    let moviesUrl = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;

    superagent.get(moviesUrl)
        .then(movieResponse => {
            const movieData = movieResponse.body.results;
            response.send(movieData.map(data => {
                return new Movie(data);
            }));
        }).catch(error => handleError(error, request, response));
}); 

app.get('*',(request, response) => {
    response.status(404).send('Sorry, something is wrong');
})

function errorHandler(error, request, response) {
    response.status(500).send({status: 500, responseText: 'That did not go as expected'});
  }

dbClient.connect()
  .then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on ${PORT}`);
    });
  });
