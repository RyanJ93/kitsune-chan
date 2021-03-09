'use strict';

const lala = require('@lala.js/core');
const config = require('../../config/config.json');

class LoggerProvider extends lala.Provider {
    static async setup(){
        if ( config.hasOwnProperty('sentryDNS') && config.sentryDNS !== '' && typeof config.sentryDNS === 'string' ){
            lala.reporters.SentryReporter.setup(config.sentryDNS);
            lala.Logger.addReporter(new lala.reporters.SentryReporter());
        }
    }
}

module.exports = LoggerProvider;
