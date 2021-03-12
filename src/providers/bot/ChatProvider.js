'use strict';

const lala = require('@lala.js/core');
const CommandRouter = require('../../CommandRouter');
const ChatController = require('../../controllers/bot/ChatController');
const HelpService = require('../../services/HelpService');
const LocaleManager = require('../../support/LocaleManager');

class ChatProvider extends lala.Provider {
    static async setup(){
        const labels = LocaleManager.getLabelTranslationsMulti([
            'help.chat.say',
            'help.chat.help'
        ]);
        CommandRouter.registerCommand('say', ChatController, 'say');
        HelpService.registerCommand('say', 'Chat', labels['help.chat.say']);
        CommandRouter.registerCommand('help', ChatController, 'help');
        HelpService.registerCommand('help', 'Chat', labels['help.chat.help']);
    }
}

module.exports = ChatProvider;
