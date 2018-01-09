var http = require('http');
const Emotions = require('./Emotions');
const fs = require('fs');
const request = require('request');

const tlvId = '293397';

var server = http.createServer(function(request, response) {

    if (request.method === 'GET') {
        if (request.url === '/test')
            return test(response);
        if (request.url === '/weather')
            return getWeather(tlvId).then(weather => {
                response.writeHead(200, {"Content-Type": "text/plain"});
                response.end(JSON.stringify(weather));
            })

        return defaultResponse(request, response);
    } else {
        if (request.url === '/path') {
            let body = "";
            request.on('data', function (chunk) {
              body += chunk;
            });
            request.on('end', function () {
              console.log('body: ' + body);
              var jsonObj = JSON.parse(body);
                handlePath(request, response, jsonObj.path)
            })
            return;
        }
        return defaultResponse(request, response);
    } 
    defaultResponse(request, response);
});

function defaultResponse(request, response) {
    response.writeHead(200, {"Content-Type": "text/plain"});
    response.write(`${request.url}\n`);
    response.write(`${request.method}\n`);
    response.end("Hello World!");
}

console.log('starting cool app');
var port = process.env.PORT || 1337;
server.listen(port);

console.log("Server running at http://localhost:%d", port);

function handlePath(request, response, path) {
    console.log('path', path);
    return readImage(path)
    .then(image => { return getEmotion(image) })
    .then(emotion => {
        return tlvWeather().then(weather => {return {weather: weather, emotion: emotion}})
    })
    .then(emotionAndWeather => { 
        console.log('emotion: ', emotionAndWeather.emotion);
        console.log('weather: ', emotionAndWeather.weather);
        response.writeHead(200, {"Content-Type": "application/json"});
        response.write(JSON.stringify(emotionAndWeather));
        response.end();
    })
}

function getEmotion(image) {
    return new Emotions().getDominentEmotion(image);
}

function readImage(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, function(err, data) {
            if (err) reject(err)
            resolve(data)
        })
    })
}

function test(response) {
    return readImage('./server/gil.jpg')
        .then(image => { return getEmotion(image) })
        .then(emotion => { 
            console.log('emotion: ', emotion);
            response.writeHead(200, {"Content-Type": "text/plain"});
            response.write(`emotion: ${emotion}`);
            response.end();
        })
}

function tlvWeather() {
    return getWeather(tlvId)
    .then(weather => {return weather.state});
}

function getWeather(cityId) {
    return new Promise((resolve, reject) => {
    request('http://api.openweathermap.org/data/2.5/weather?id=' + cityId + '&APPID=ff908e323a7a4e90bd9748e1b8880d26&units=metric', {
        json: true
    }, (err, res, result) => {
        if (err) {
           reject(err);
        }

        let weatherInfo = {};
        weatherInfo.city = result.name;
        weatherInfo.temp = result.main.temp;
        weatherInfo.description = result.weather[0].description;
        weatherInfo.state = result.main.temp > 23 ? 'Hot' : 'cold';

        console.log('City: ' + weatherInfo.city);
        console.log('Temp: ' + weatherInfo.temp);
        console.log('Weather description: ' + weatherInfo.description);
        console.log('State: ' + weatherInfo.state);
        console.log(weatherInfo + ' weatherInfo');

        resolve(weatherInfo);
    });
})};