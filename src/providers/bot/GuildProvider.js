'use strict';

const lala = require('@lala.js/core');
const CommandRouter = require('../../CommandRouter');
const GuildBotController = require('../../controllers/bot/GuildBotController');
const HelpService = require('../../services/HelpService');
const LocaleManager = require('../../support/LocaleManager');

class GuildProvider extends lala.Provider {
    static async setup(){
        const labels = LocaleManager.getLabelTranslationsMulti([
            'help.guild.serverinfo'
        ]);
        CommandRouter.registerCommand('serverinfo', GuildBotController, 'serverinfo');
        HelpService.registerCommand('serverinfo', 'Guild', labels['help.guild.serverinfo']);
    }
}

module.exports = GuildProvider;
