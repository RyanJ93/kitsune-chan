'use strict';

const fs = require('fs');
const lala = require('@lala.js/core');

class LocaleManager {
    static #locales = [];

    static setAvailableLocales(locales){
        LocaleManager.#locales = [];
        LocaleManager.#locales = locales.filter((locale) => typeof locale === 'string');
    }

    static async #loadLocalePackage(locale){
        const path = __dirname + '/' + LocaleManager.LOCALE_PACKAGE_PATH + locale + '.json';
        const contents = await fs.promises.readFile(path);
        const labels = JSON.parse(contents.toString());
        return labels === null || typeof labels !== 'object' ? null : {
            labels: labels,
            locale: locale
        };
    }

    static async loadLabels(){
        const localeCache = lala.CacheRepository.get('localeCache');
        const localePackages = await Promise.all(LocaleManager.#locales.map((locale) => {
            return LocaleManager.#loadLocalePackage(locale);
        }));
        const processes = [];
        localePackages.forEach((localePackage) => {
            if ( localePackage !== null ){
                for ( const key in localePackage.labels ){
                    if ( localePackage.labels.hasOwnProperty(key) && typeof localePackage.labels[key] === 'string' ){
                        processes.push(localeCache.set(localePackage.locale + '.' + key, localePackage.labels[key]));
                    }
                }
            }
        });
        await Promise.all(processes);
    }

    static getLabel(key, locale){
        const localeCache = lala.CacheRepository.get('localeCache');
        return localeCache.get(locale + '.' + key, {
            silent: true
        });
    }

    static getLabelMulti(keys, locale){
        const localeCache = lala.CacheRepository.get('localeCache');
        keys = keys.map((key) => { return locale + '.' + key });
        return localeCache.getMulti(keys, {
            silent: true
        });
    }

    static getLabelTranslations(key){
        const localeCache = lala.CacheRepository.get('localeCache');
        const keys = LocaleManager.#locales.map((locale) => { return locale + '.' + key });
        return localeCache.getMulti(keys, {
            silent: true
        });
    }

    static async getLabelTranslationsMulti(keys){
        const localeCache = lala.CacheRepository.get('localeCache'), keyList = [], labels = {};
        LocaleManager.#locales.forEach((locale) => { 
            const additionalKeys = keys.map((key) => { return locale + '.' + key });
            keyList.push(...additionalKeys);
        });
        const entries = await localeCache.getMulti(keyList, {
            silent: true
        });
        for( const key in entries ){
            const index = key.indexOf('.');
            if ( index > 0 ){
                const labelKey = key.substr(index + 1);
                if ( !labels.hasOwnProperty(labelKey) ){
                    labels[labelKey] = {};
                }
                labels[labelKey][key.substr(0, index)] = entries[key];
            }
        }
        return labels;
    }
}

Object.defineProperty(LocaleManager, 'LOCALE_PACKAGE_PATH', {
    value: '../../assets/locales/',
    writable: false
});

module.exports = LocaleManager;
