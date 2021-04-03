'use strict';

const lala = require('@lala.js/core');
const CommandRouter = require('../../CommandRouter');
const UserBotController = require('../../controllers/bot/UserBotController');
const HelpService = require('../../services/HelpService');
const LocaleManager = require('../../support/LocaleManager');

class UserProvider extends lala.Provider {
    static async setup(){
        const labels = LocaleManager.getLabelTranslationsMulti([
            'help.user.userinfo'
        ]);
        CommandRouter.registerCommand('userinfo', UserBotController, 'userinfo');
        HelpService.registerCommand('userinfo', 'User', labels['help.user.userinfo']);
    }
}

module.exports = UserProvider;
