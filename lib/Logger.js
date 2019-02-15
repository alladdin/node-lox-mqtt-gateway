const winston = require('winston');

var Logger = function(config) {
    if (!config){
        return winston.createLogger({
            transports: [
                new (winston.transports.Console)({
                    timestamp: true,
                    colorize: true,
                    level: 'debug',
                })
            ]
        });
    }

    var transports = [];

    config.forEach(function(item){
        var transport_class = Object.keys(item)[0];
        transports.push(new (winston.transports[transport_class])(
            item[transport_class]
        ));
    });
    var logger = winston.createLogger({transports: transports});
    logger.exitOnError = false;

    return logger;
};

 

module.exports = Logger;
