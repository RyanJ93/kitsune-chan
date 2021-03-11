'use strict';

module.exports = {
    bot: require('./bot'),
    web: require('./web'),
    DatabaseProvider: require('./DatabaseProvider'),
    LoggerProvider: require('./LoggerProvider'),
    LocaleProvider: require('./LocaleProvider'),
    CacheProvider: require('./CacheProvider')
};
