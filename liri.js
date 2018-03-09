require("dotenv").config();

const Spotify = require('node-spotify-api');
const request = require('request');
const Twitter = require('twitter');
const keys = require('./keys.js');
const fs = require("fs");

let spotify = new Spotify(keys.spotify);
let client = new Twitter(keys.twitter);

const input = process.argv[2];
const search = process.argv;

// The following search results are a bit hit or miss depending on the song/movie, especially if there are multiple items with the same or similar names. If this code were to go into production, I would likely utilize something like inquirer to gather more precise user input for the API search. Additionally, any titles with an apostrophy will break the API query.

function searchSpotify(title) {
  if (title === '') {
    spotify.search({ type: 'track', query: 'Ace of Base', limit: 1 }, function (err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }
      else {
        spotifyPrint(data);
      }
    })
  } else {
    spotify.search({ type: 'track', query: title, limit: 1 }, function (err, data) {
      if (err) {
        return console.log('Error occurred: ' + err);
      }
      else {
        spotifyPrint(data);
      }
    });
  }
}

function spotifyPrint(data) {
  for (let key in data) {
  console.log('============================================');
  console.log('Artist: ' + data[key].items[0].artists[0].name + '\n' + 'Song Name: ' + data[key].items[0].name + '\n' + 'Preview Link: ' + data[key].items[0].album.external_urls.spotify + '\n' + 'Album: ' + data[key].items[0].album.name);
  console.log('============================================');
  }
}

function imdbSearch(title) {
  if (title === '') {
    request('http://www.omdbapi.com/?apikey=a6df7151&t=Mr%20Nobody', function (error, response, body) {
      if (error) {
        return console.log('Error occurred: ' + error);
      } else {
        imdbPrint(body);
      }
    });
  }  else {
    request('http://www.omdbapi.com/?apikey=a6df7151&t=' + title, function (error, response, body) {
      if (error) {
        return console.log('Error occurred: ' + error);
      } else {
        imdbPrint(body);
      }
    });
  }
}

function imdbPrint(body) {
  console.log('============================================');
  console.log('Title: ' + JSON.parse(body).Title + '\n' + 'Year: ' + JSON.parse(body).Year + '\n' + 'IMDB Rating: ' + JSON.parse(body).imdbRating + '\n' + 'Rotten Tomatoes Rating: ' + JSON.parse(body).Ratings[1].Value + '\n' + 'Country: ' + JSON.parse(body).Country + + '\n' + 'Plot: ' + JSON.parse(body).Plot + '\n' + 'Actors: ' + JSON.parse(body).Actors);
  console.log('============================================');
}

// Twitter Feed
if (input === 'my-tweets') {
  let params = { user_id: '950912466606702593', count: '20', tweet_mode: 'extended', exclude_replies: 'false', include_rts: 'true' };
  client.get('statuses/user_timeline', params, function (error, tweets, response) {
    if (!error) {
      for (let key in tweets) {
        console.log('============================================');
        console.log(tweets[key].created_at + ": " + tweets[key].full_text + '\n');
      }
    }
  });

  // Spotify Search
} else if (input === 'spotify-this-song') {
  let searchTerms = "";
  for (var i = 3; i < search.length; i++) {
    searchTerms += search[i] + ' ';
  }
  searchSpotify(searchTerms);

  // IMDB Search
} else if (input === 'movie-this') {
  let searchTerms = "";
  for (var i = 3; i < search.length; i++) {
    searchTerms += search[i] + ' ';
  }
  imdbSearch(searchTerms);

  // Random Search
} else if (input === 'do-what-it-says') {
  fs.readFile("random.txt", "utf8", function(error, data) {
    if (error) {
      return console.log(error);
    }
    else {
      console.log(data);
      var commandData = data.split(",");
      searchSpotify(commandData[1].replace('"',""))
    }
  }
)
}

