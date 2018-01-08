const request = require('request');
const _ = require('lodash');

class Emotions {
    getDominentEmotion(image) {
        return getEmotions(image)
            .then(emotionsResponse => {
                console.log('Got emotions')
                return dominentEmotion(emotionsResponse)
            })
            .catch(err => console.error(err))
    }
}

module.exports = Emotions;

function readImage(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, function(err, data) {
            if (err) reject(err)
            resolve(data)
        })
    })
}

function getEmotions(image) {
    return new Promise((resolve, reject) => {
        console.log('Getting emotions')
        request.post({
            url: 'https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize',
            headers: {
                'Content-Type' : 'application/octet-stream',
                'Ocp-Apim-Subscription-Key' : '75340b2d03e341f39db23c366d7d6eec'
            },
            body: image,
            timeout: 20000 
        }, (error, response) => {
            if (response && response.statusCode >= 300) {
                console.error(`body: ${response && JSON.stringify(response.body)}`);
            }
            if (error) {
                console.error('error: ', error)
                reject(error)
            } else {
                resolve(JSON.parse(response.body))
            }
        })
    })
}

function dominentEmotion(response) {
    if (!response.length) {
        console.warn('No face found in image');
        return 'happiness'
    } else {
        let best;
        _.forOwn(response[0].scores, function(value, key) { 
            if (!best || (key !== 'neutral' && best.score < value)) 
            best = {emotion: key, score: value};
        });
        return best.emotion;
    }
}
