const node_lox_ws_api = require("node-lox-ws-api");

function _limit_string(text, limit){
    if (text.length <= limit){
        return text;
    }
    return text.substr(0, limit) + '...('+text.length+')';
}

var WebSocketAPI = function(config, app) {
    var ws_auth = config.encrypted ? 'AES-256-CBC' : 'Hash';
    var client = new node_lox_ws_api(config.host, config.username, config.password, true, ws_auth);
    var text_logger_limit = 100;

    app.on('exit', function (code) {
        client.abort();
    });

    client.on('connect', function() {
        app.logger.info("WebSocketAPI - connect");
    });

    client.on('authorized', function() {
        app.logger.info("WebSocketAPI - authorized");
    });

    client.on('connect_failed', function() {
        app.logger.error("WebSocketAPI - connect failed");
    });

    client.on('connection_error', function(error) {
        app.logger.error("WebSocketAPI - connection error: "+error);
        app.exit(1);
    });

    client.on('close', function() {
        app.logger.info("WebSocketAPI - close");
    });

    client.on('send', function(message) {
        app.logger.debug("WebSocketAPI - send message: "+message);
    });

    client.on('message_text', function(message) {
        var data = {
            type: message.type,
        };
        switch(message.type){
            case 'json':
                data.json = _limit_string(JSON.stringify(message.json), text_logger_limit);
                break;
            case 'control':
                data.control = message.control;
                data.value = message.value;
                data.code = message.code;
                break;
            default:
                data.text = _limit_string(message.data, text_logger_limit);
        }
        app.logger.debug("WebSocketAPI - received text message: ", data);
    });

    client.on('message_file', function(message) {
        var data = {
            type: message.type,
            filename: message.filename,
        };
        switch(message.type){
            case 'json':
                data.json = _limit_string(JSON.stringify(message.data), text_logger_limit);
                break;
            case 'binary':
                data.length = message.data,length;
                break;
            default:
                data.text = _limit_string(message.data, text_logger_limit);
        }
        app.logger.debug("WebSocketAPI - received file: ", data);
    });

    function _update_event(uuid, evt) {
        var data = {
            uuid: uuid,
            'event': _limit_string(JSON.stringify(evt), text_logger_limit),
        };
        app.logger.debug("WebSocketAPI - received update event: ", data);
    }

    client.on('update_event_value', _update_event);
    client.on('update_event_text', _update_event);
    client.on('update_event_daytimer', _update_event);
    client.on('update_event_weather', _update_event);

    client.on('message_invalid', function(message) {
        app.logger.warn("WebSocketAPI - invalid message: "+JSON.stringify(message));
    });

    client.on('keepalive', function(time) {
        app.logger.debug('WebSocketAPI - keepalive ('+time+'ms)');
    });

    client.on('message_header', function(header) {
        app.logger.debug('WebSocketAPI - received message header ('+header.next_state()+'):', header);
    });

    client.on('message_event_table_values', function(messages) {
        app.logger.debug('WebSocketAPI - received value messages:', messages.length);
    });

    client.on('message_event_table_text', function(messages) {
        app.logger.debug('WebSocketAPI - received text messages:', messages.length);
    });

    client.on('get_structure_file', function(data) {
        app.logger.debug("WebSocketAPI - get structure file "+data.lastModified);
    });

    return client;
};

module.exports = WebSocketAPI;
