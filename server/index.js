var http = require('http');
const Emotions = require('./Emotions');
const fs = require('fs');

var server = http.createServer(function(request, response) {

    if (request.method === 'GET') {
        if (request.url === '/test')
            return test(response);
        else defaultResponse(request, response);
    } else {
        defaultResponse(request, response);
    }
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

