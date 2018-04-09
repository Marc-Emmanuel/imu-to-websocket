var config = require('./config/config');
var TransmitterFactory = require('./transmitter/transmitter');
var transmitterFactory = new TransmitterFactory(config);

var transmitter = transmitterFactory.build();
transmitter.setHysteresis(function (data) {

    var directionY = data.y - transmitter.rawLastFrame.y;
    var directionP = data.r - transmitter.rawLastFrame.p;
    var directionR = data.r - transmitter.rawLastFrame.r;
    var hysteresisData = {
        y: null,
        p: null,
        r: null
    };
    if (directionY > 1) {
        hysteresisData.y = parseFloat(data.y) + 1;
    } else if (directionY < -1) {
        hysteresisData.y = parseFloat(data.y) - 1;
    } else {
        hysteresisData.y = parseFloat(data.y);
    }


    if (directionP > 1) {
        hysteresisData.p = parseFloat(data.p) + 1;
    } else if (directionP < -1) {
        hysteresisData.p = parseFloat(data.p) - 1;
    } else {
        hysteresisData.p = parseFloat(data.p);
    }

    if (directionR > 1) {
        hysteresisData.r = parseFloat(data.r) + 1;
    } else if (directionR < -1) {
        hysteresisData.r = parseFloat(data.r) - 1;
    } else {
        hysteresisData.r = parseFloat(data.r);
    }


    if (config.debug) {
        console.log(hysteresisData);
    }


    return hysteresisData;
});


transmitter.setDataFormat(function (data) {
    return {
        y: Math.floor(data.y),
        p: Math.floor(data.p),
        r: Math.floor(data.r)
    };
});

transmitter.setSerialEventHandler(function (data) {
    transmitter.send(data);
});
