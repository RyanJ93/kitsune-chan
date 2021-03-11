'use strict';

const lala = require('@lala.js/core');

class CacheProvider extends lala.Provider {
    static async setup(){
        const localeCache = new lala.Cache();
        lala.CacheRepository.register('localeCache', localeCache);
    }
}

module.exports = CacheProvider;
