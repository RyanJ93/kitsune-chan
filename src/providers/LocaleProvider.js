'use strict';

const lala = require('@lala.js/core');
const LocaleManager = require('../support/LocaleManager');

class LocaleProvider extends lala.Provider {
    static async setup(){
        LocaleManager.setAvailableLocales(['it']);
        await LocaleManager.loadLabels();
    }
}

module.exports = LocaleProvider;
