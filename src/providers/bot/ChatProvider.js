'use strict';

const lala = require('@lala.js/core');
const CommandRouter = require('../../CommandRouter');
const ChatBotController = require('../../controllers/bot/ChatBotController');
const HelpService = require('../../services/HelpService');
const LocaleManager = require('../../support/LocaleManager');

class ChatProvider extends lala.Provider {
    static async setup(){
        const labels = LocaleManager.getLabelTranslationsMulti([
            'help.chat.say',
            'help.chat.help',
            'help.chat.info'
        ]);
        CommandRouter.registerCommand('say', ChatBotController, 'say');
        HelpService.registerCommand('say', 'Chat', labels['help.chat.say']);
        CommandRouter.registerCommand('help', ChatBotController, 'help');
        HelpService.registerCommand('help', 'Chat', labels['help.chat.help']);
        CommandRouter.registerCommand('info', ChatBotController, 'info');
        HelpService.registerCommand('info', 'Chat', labels['help.chat.info']);
    }
}

module.exports = ChatProvider;
