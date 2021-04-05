'use strict';

const fs = require('fs');
const path = require('path');
const lala = require('@lala.js/core');

class LocaleManager {
    static #localeRoleList = new Map();
    static #localizedLabels = new Map();
    static #defaultLocale = LocaleManager.DEFAULT_LOCALE;

    static async #loadPackage(fileName){
        const packagePath = __dirname + '/' + LocaleManager.LOCALE_PACKAGE_PATH + '/' + fileName;
        const contents = await fs.promises.readFile(packagePath);
        const data = JSON.parse(contents.toString());
        if ( data.locale !== '' && typeof data.locale === 'string' && data.labels !== null && typeof data.labels === 'object' ){
            if ( Array.isArray(data.roles) ){
                data.roles.forEach((role) => {
                    if ( role !== '' && typeof role === 'string' ){
                        LocaleManager.#localeRoleList.set(role, data.locale);
                    }
                });
            }
            LocaleManager.#localizedLabels.set(data.locale, data.labels);
        }
    }

    static setDefaultLocale(defaultLocale){
        if ( defaultLocale === '' || typeof defaultLocale !== 'string' ){
            throw new lala.InvalidArgumentException('Invalid default locale.', 1);
        }
        LocaleManager.#defaultLocale = defaultLocale;
    }

    static getDefaultLocale(){
        return LocaleManager.#defaultLocale;
    }

    static async loadLocales(){
        LocaleManager.#localeRoleList.clear();
        LocaleManager.#localizedLabels.clear();
        const packageDirectory = __dirname + '/' + LocaleManager.LOCALE_PACKAGE_PATH;
        const files = await fs.promises.readdir(packageDirectory);
        await Promise.all(files.map((fileName) => {
            if ( path.extname(fileName).toLowerCase() === '.json' ){
                return LocaleManager.#loadPackage(fileName);
            }
        }));
    }

    static getLocaleByGuildMember(guildMember, useDefaultAsFallback = true){ // preferredLocale:
        let guildPreferredLocale = guildMember.guild.preferredLocale, found = false;
        let locale = useDefaultAsFallback !== false ? LocaleManager.#defaultLocale : null;
        for ( const [roleID, role] of guildMember.roles.cache ){
            const candidate = LocaleManager.#localeRoleList.get(role.name.toLowerCase());
            if ( typeof candidate === 'string' ){
                locale = candidate;
                found = true;
                break;
            }
        }
        if ( !found ){
            const shortLocale = guildPreferredLocale.substr(0, 2);
            if ( LocaleManager.#localizedLabels.has(guildPreferredLocale) ){
                locale = guildPreferredLocale;
            }else if ( LocaleManager.#localizedLabels.has(shortLocale) ){
                locale = shortLocale;
            }
        }
        return locale;
    }

    static getLabel(key, locale){
        const labelStack = LocaleManager.#localizedLabels.get(locale);
        return typeof labelStack === 'undefined' || !labelStack.hasOwnProperty(key) ? null : labelStack[key];
    }

    static getLabelMulti(keys, locale){
        const labelStack = LocaleManager.#localizedLabels.get(locale), labels = {};
        if ( typeof labelStack !== 'undefined' ){
            keys.forEach((key) => {
                if ( labelStack.hasOwnProperty(key) ){
                    labels[key] = labelStack[key];
                }
            });
        }
        return labels;
    }

    static getLabelTranslations(key){
        const labels = {};
        for ( const [locale, labelStack] of LocaleManager.#localizedLabels ){
            if ( labelStack.hasOwnProperty(key) ){
                labels[locale] = labelStack[key];
            }
        }
        return labels;
    }

    static getLabelTranslationsMulti(keys){
        const labels = {};
        for ( const [locale, labelStack] of LocaleManager.#localizedLabels ){
            keys.forEach((key) => {
                if ( labelStack.hasOwnProperty(key) ){
                    if ( !labels.hasOwnProperty(key) ){
                        labels[key] = {};
                    }
                    labels[key][locale] = labelStack[key];
                }
            });
        }
        return labels;
    }
}

Object.defineProperty(LocaleManager, 'LOCALE_PACKAGE_PATH', {
    value: '../../assets/locales/',
    writable: false
});

Object.defineProperty(LocaleManager, 'DEFAULT_LOCALE', {
    value: 'en',
    writable: false
});


module.exports = LocaleManager;
