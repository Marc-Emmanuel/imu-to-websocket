var sp = require('serialport');
var osc = require('node-osc');
var http = require('http');
var fs = require('fs');


function TransmitterFactory(config) {
    this.conf = config;
    var transmitter = {};
    transmitter.dev = null;
    transmitter.server = null;
    transmitter.lastTimeStamp = -1;
    transmitter.oscClients = [];
    transmitter.serial = null;
    transmitter.io = null;
    transmitter.lastFrame = null;

    this.build = function () {
        var localConf = this.conf;
        transmitter.dev = this.conf.dev;
        transmitter.hysteresis = this.conf.hysteresis;
        transmitter.rawLastFrame = null;
        transmitter.data_formatter = this.conf.data_formatter;
        //Just a dummy server to encapsulate socket.io 
        transmitter.server = http.createServer(function (req, res) {
            if (res) {
                res.status(404).send('not found');
            }
        });
        transmitter.io = require("socket.io")(transmitter.server);
        transmitter.io.on("connection", function (socket) {
            console.log("Client connected");
        });

        for (var i = 0; i < this.conf.osc_recipient.length; i++) {
            transmitter.oscClients.push(new osc.Client(this.conf.osc_recipient[i], this.conf.osc_port));
        }


        transmitter.send = function (data) {
            var d = null;
            if (transmitter.lastFrame !== null) {
                d = transmitter.lastFrame;
            } else {
                d = {
                    y: 360,
                    p: 360,
                    r: 360
                };
            }
            try {
                d = JSON.parse(data);
            } catch (err) {
                //That should not append
                console.log(err);
            }
            transmitter.rawLastFrame = d;
            d = transmitter.hysteresis(d); //hysteresis
            d = transmitter.data_formatter(d); // Format the datas (e.g. float to int)
            transmitter.io.emit(localConf.socket_io_event_tag, JSON.stringify(d));
            if (d.y && (Date.now() - transmitter.lastTimeStamp > localConf.timeout)) {
                for (var i = 0; i < transmitter.oscClients.length; i++) {
                    transmitter.oscClients[i].send(localConf.osc_channel, d.y, function () {});
                }
                transmitter.lastTimeStamp = Date.now();
            }
            transmitter.lastFrame = d;
            if (localConf.debug) {
                console.log(data);
            }
            if (localConf.dump) {
                fs.appendFileSync(localConf.file_name, d.y + "," + d.p + "," + d.r + "," +
                    Date.now() + "\n");
            }
        };

        transmitter.setHysteresis = function (hysteresisFunction) {
            transmitter.hysteresis = hysteresisFunction;
        };

        transmitter.setDataFormat = function (dataFormatterFunction) {
            transmitter.data_formatter = dataFormatterFunction;
        };

        var SerialPort = sp.SerialPort;
        transmitter.serial = new SerialPort(transmitter.dev, {
            parser: sp.parsers.readline('\n'),
            baudrate: this.conf.baudrate
        });
        transmitter.serial.on('open', function (err) {
            if (err)
                console.log(err);
        });

        transmitter.setSerialEventHandler = function (helper) {
            transmitter.serial.on('data', helper);
        }
        transmitter.lastTimeStamp = Date.now();
        if (localConf.debug) {
            console.log("Transmitter built");
        }
        if (localConf.dump) {
            fs.writeFileSync(localConf.file_name, "yaw,pitch,roll,timestamp");
        }
        transmitter.server.listen(this.conf.socket_io_port);
        console.log("Websocket listening on " + this.conf.socket_io_port);
        console.log("Sending osc to " + this.conf.osc_recipient.join(', '));
        return transmitter;
    };
}

module.exports = TransmitterFactory;
