var config = {
    baudrate: 115200,
    debug: false,
    dev: '/dev/cu.usbserial-14P52780',
    dump: false,
    file_name: "file" + Date.now() + ".csv",
    data_formatter: function (data) {
        return data;
    }, //must return the data -> pass all data
    hysteresis: function (data) {
        return data;
    },
    osc_port: 9000,
    osc_channel: "/rotation",
    osc_recipient: ["0.0.0.0", "127.0.0.1", "137.194.23.35", "137.194.23.103"],
    socket_io_port: 8080,
    socket_io_event_tag: "data",
    timeout: 10 //ms -> avoid changing, serialPort may become a bit grumpy
};

module.exports = config;
