'use strict';

const lala = require('@lala.js/core');
const LocaleManager = require('../support/LocaleManager');
const config = require('../../config/config.json');

class LocaleProvider extends lala.Provider {
    static async setup(){
        if ( typeof config.defaultLocale === 'string' ){
            LocaleManager.setDefaultLocale(config.defaultLocale);
        }
        await LocaleManager.loadLocales();
    }
}

module.exports = LocaleProvider;
