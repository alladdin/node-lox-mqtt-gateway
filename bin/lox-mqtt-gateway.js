#!/usr/bin/env node

const lox_mqtt_gateway = require('../lib/index.js');

if (!process.env.NODE_CONFIG_DIR){
    process.env.NODE_CONFIG_DIR = __dirname+"/../config/";
}
var config = require("config");

var logger = lox_mqtt_gateway.Logger(config.get('winston'));
var app = new lox_mqtt_gateway.App(logger);
var mqtt_client = lox_mqtt_gateway.mqtt_builder(config.get('mqtt'), app);
var lox_client = lox_mqtt_gateway.WebSocketAPI(config.get('miniserver'), app);
var lox_mqtt_adaptor = undefined;

app.on('exit', function(code) {
    if (lox_mqtt_adaptor){
        lox_mqtt_adaptor.abort();
    }
});

lox_client.on('update_event', function(uuid, value){
    if (lox_mqtt_adaptor){
        lox_mqtt_adaptor.set_value_for_uuid(uuid, value);
    }
});

lox_client.on('get_structure_file', function(data) {
    if (lox_mqtt_adaptor){
        lox_mqtt_adaptor.abort();
    }

    lox_mqtt_adaptor = new lox_mqtt_gateway.Adaptor(lox_mqtt_gateway.Structure.create_from_json(data));

    mqtt_client.subscribe(lox_mqtt_adaptor.get_topic_for_subscription());

    lox_mqtt_adaptor.on('for_mqtt', function(topic, data){
        logger.debug("MQTT Adaptor - for mqtt: ", {topic: topic, data: data});
        mqtt_client.publish(topic, data);
    });
});

lox_client.connect();
