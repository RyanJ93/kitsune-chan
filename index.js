'use strict';

const lala = require('@lala.js/core');
const providers = require('./src/Providers');

lala.init({
    providers: [
        providers.LoggerProvider,
        providers.DatabaseProvider,
        providers.CacheProvider,
        providers.LocaleProvider,
        providers.bot.BotProvider,
        providers.bot.ChatProvider
    ]
}).then(() => {
    console.log('Sono pronta!');
});
