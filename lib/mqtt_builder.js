const mqtt = require('mqtt');

var mqtt_builder = function(config, app) {
    var client = mqtt.connect(config.host, config.options);

    app.on('exit', function (code) {
        client.end();
    });

    client.on('connect', function(connack) {
        app.logger.info("MQTT - connect", connack);
    });

    client.on('reconnect', function() {
        app.logger.debug("MQTT - reconnect");
    });

    client.on('close', function() {
        app.logger.info("MQTT - close");
    });

    client.on('offline', function() {
        app.logger.info("MQTT - offline");
    });

    client.on('error', function(error) {
        app.logger.error("MQTT - error: " + error);
        app.exit(1, error);
    });

    client.on('message', function(topic, message, packet) {
        app.logger.debug("MQTT - message: ", {topic: topic, message: message, packet: packet});
    });

    return client;
};

module.exports = mqtt_builder;
