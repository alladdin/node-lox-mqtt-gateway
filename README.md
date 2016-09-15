# node-lox-mqtt-gateway

[![Version npm](https://img.shields.io/npm/v/node-lox-mqtt-gateway.svg?style=flat-square)](https://www.npmjs.com/package/node-lox-mqtt-gateway)[![npm Downloads](https://img.shields.io/npm/dm/node-lox-mqtt-gateway.svg?style=flat-square)](https://www.npmjs.com/package/node-lox-mqtt-gateway)

[![NPM](https://nodei.co/npm/node-lox-mqtt-gateway.png?downloads=true&downloadRank=true)](https://nodei.co/npm/node-lox-mqtt-gateway/)

Gateway for Loxone™ miniserver to communicate with mqtt broker

For communication with miniserver is used WebSocket api described in [Loxone™ API Documentation](http://www.loxone.com/enen/service/documentation/api/api.html)

## Preamble

This is experimental version.

Use it at your own risk.

## Quick start

`sudo npm install -g node-lox-mqtt-gateway`

`lox-mqtt-gateway --NODE_CONFIG='{"mqtt":{"host":"mqtt://localhost:1883","options":{"username":"XXX","password":"YYY"}},"miniserver":{"host":"192.168.0.77:80","username":"XXX","password":"YYY"}}'`

## MQTT Interface

### MQTT topic base

`mqtt_prefix/category/room/control_name/{state|cmd}`

**example**

`lox/light/bedroom/main_light/state`

### States of Loxone™ miniserver to MQTT

If you tries to get the state of specific control you need to subscribe

#### topic

`(MQTT topic base)/state`

#### message contains data

in **JSON** format.

**TODO:** Make documentation for all controls

### MQTT to Loxone™ miniserver actions

If you could make some action you must publish message with:

#### topic

`(MQTT topic base)/cmd`

#### data

There is a command string like in [Loxone™ API Structure file documentation](http://www.loxone.com/tl_files/loxone/downloads/other/loxone-structure-file.pdf)


#### example of whole message

```json
{
    "topic": "lox/light/bedroom/main_light/cmd",
    "data": "on"
}
```


## Configuration

configuration file has 3 sections

### sections

#### winston (logger)

It contains array of transports with its options.

```json
{
    "winston": [{
        "Console": {
            "level": "debug"
        },
        "File": {
            "level": "info",
            "filename": "somefile.log"
        }
    }]
}
```

#### mqtt

It contains host and options for [mqtt](https://github.com/mqttjs/MQTT.js).

[Detailed explanation of the options.](https://github.com/mqttjs/MQTT.js#mqttclientstreambuilder-options)

```json
{
    "mqtt": {
        "host": "mqtt://localhost:1883",
        "options": {
            "username": "test",
            "password": "test1234"
        }
    }
}
```

#### miniserver

It contains:

* **host** - miniserver address (hostname:port)
* **username** - credentials for miniserver
* **password**
* **readonly** - if it's set to true then no commands will be send to miniserver - it's for testing and development
* **mqtt_prefix** - topic prefix for Loxone™ messages

```json
{
    "miniserver": {
        "host": "192.168.0.77:80",
        "username": "testlox",
        "password": "1234",
        "readonly": false,
        "mqtt_prefix": "lox"
    }
}
```
### your own config dir

You could use your own config dir

`lox-mqtt-gateway --NODE_CONFIG_DIR='/your/config/dir'`

### example

#### /your/config/dir/default.json

```json
{
    "winston": [{
        "Console": {
            "level": "debug",
            "colorize": true,
            "timestamp": true
        }
    }],
    "mqtt": {
        "host": "mqtts://localhost:8883",
        "options": {
            "rejectUnauthorized": false,
            "username": "test",
            "password": "test1234",
            "clientId": "lox_to_mqtt_gateway"
        }
    },
    "miniserver": {
        "host": "192.168.0.77:80",
        "username": "testlox",
        "password": "1234",
        "readonly": false,
        "mqtt_prefix": "lox"
    }
}
```


